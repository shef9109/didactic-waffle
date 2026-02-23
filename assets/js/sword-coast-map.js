(function () {
  const data = window.SWORD_COAST_DATA;
  if (!data || !Array.isArray(data.points) || typeof L === 'undefined') {
    return;
  }

  const mapElement = document.getElementById('sword-coast-map');
  if (!mapElement) {
    return;
  }

  const categoryMap = new Map((data.categories || []).map((cat) => [cat.id, cat]));
  const width = Number(data.meta?.width) || 6420;
  const height = Number(data.meta?.height) || 4062;

  const points = data.points
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    .map((point) => ({
      ...point,
      searchLabel: normalize(`${point.ruName || ''} ${point.name || ''}`),
    }));

  const pointById = new Map(points.map((point) => [point.id, point]));
  const markersById = new Map();

  let activePointId = null;
  let currentResults = [];

  const searchInput = document.getElementById('location-search');
  const clearSearchButton = document.getElementById('clear-location-search');
  const searchResults = document.getElementById('search-results');
  const searchFeedback = document.getElementById('search-feedback');
  const selectedName = document.getElementById('selected-location-name');
  const selectedMeta = document.getElementById('selected-location-meta');
  const legend = document.getElementById('category-legend');
  const quickList = document.getElementById('quick-locations');
  const fitMapButton = document.getElementById('fit-map');

  const imageBounds = L.latLngBounds([0, 0], [height, width]);

  const map = L.map(mapElement, {
    crs: L.CRS.Simple,
    zoomControl: false,
    attributionControl: false,
    minZoom: -2,
    maxZoom: 2.5,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    wheelPxPerZoomLevel: 90,
    maxBounds: imageBounds.pad(0.06),
    maxBoundsViscosity: 0.85,
  });

  L.control
    .zoom({
      position: 'bottomright',
    })
    .addTo(map);

  updateTooltipScale();
  map.on('zoomend', updateTooltipScale);

  L.imageOverlay('../assets/images/maps/sword-coast.webp', imageBounds, {
    interactive: false,
    alt: 'Карта Побережья Мечей',
  }).addTo(map);

  map.fitBounds(imageBounds, {
    padding: [16, 16],
  });

  const markerLayer = L.layerGroup().addTo(map);

  for (const point of points) {
    const marker = L.circleMarker([point.y, point.x], markerStyle(point.category, false, map.getZoom()));

    marker.bindTooltip(point.ruName, {
      className: 'point-tooltip',
      direction: 'top',
      offset: [0, -8],
      opacity: 0.96,
    });

    marker.bindPopup(
      `<div class="point-popup">
        <div class="point-popup-name">${escapeHtml(point.ruName)}</div>
        <div class="point-popup-meta">${escapeHtml(categoryName(point.category))}</div>
      </div>`
    );

    marker.on('click', () => {
      focusPoint(point, {
        zoom: Math.max(map.getZoom(), 1.5),
        openPopup: true,
      });
    });

    marker.addTo(markerLayer);
    markersById.set(point.id, marker);
  }

  renderLegend();
  renderQuickButtons();
  renderSearchResults([]);
  setSearchFeedback(`Точек на карте: ${points.length}`);

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      updateSearchResults(query);
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        if (currentResults.length > 0) {
          event.preventDefault();
          focusPoint(currentResults[0], {
            zoom: 1.75,
            openPopup: true,
          });
        }
      }
    });
  }

  if (searchResults) {
    searchResults.addEventListener('click', (event) => {
      const button = event.target.closest('[data-point-id]');
      if (!button) {
        return;
      }
      const point = pointById.get(button.getAttribute('data-point-id'));
      if (!point) {
        return;
      }
      focusPoint(point, {
        zoom: 1.75,
        openPopup: true,
      });
    });
  }

  if (clearSearchButton) {
    clearSearchButton.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      updateSearchResults('');
      setSearchFeedback(`Точек на карте: ${points.length}`);
    });
  }

  if (fitMapButton) {
    fitMapButton.addEventListener('click', () => {
      map.fitBounds(imageBounds, { padding: [16, 16] });
    });
  }

  map.on('zoomend', refreshMarkerStyles);

  focusPoint(resolveInitialPoint(), {
    zoom: 0.8,
    openPopup: false,
    fly: false,
  });

  function resolveInitialPoint() {
    const hashId = decodeURIComponent((window.location.hash || '').replace(/^#/, '')).trim();
    if (hashId && pointById.has(hashId)) {
      return pointById.get(hashId);
    }

    const defaults = [
      'Врата Балдура',
      'Уотердип',
      'Невервинтер',
      'Лускан',
      'Свечной Замок',
    ];

    for (const targetName of defaults) {
      const match = points.find((point) => normalize(point.ruName) === normalize(targetName));
      if (match) {
        return match;
      }
    }

    return points[0] || null;
  }

  function renderQuickButtons() {
    if (!quickList) {
      return;
    }

    const quickTargets = [
      'Врата Балдура',
      'Уотердип',
      'Невервинтер',
      'Лускан',
      'Свечной Замок',
      'Мифрил-Холл',
      'Долина Ледяного Ветра',
    ];

    const fragment = document.createDocumentFragment();

    for (const quickName of quickTargets) {
      const point = points.find((entry) => normalize(entry.ruName) === normalize(quickName));
      if (!point) {
        continue;
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'map-quick-btn';
      button.textContent = point.ruName;
      button.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = point.ruName;
          updateSearchResults(point.ruName);
        }
        focusPoint(point, {
          zoom: 1.8,
          openPopup: true,
        });
      });

      fragment.appendChild(button);
    }

    quickList.innerHTML = '';
    quickList.appendChild(fragment);
  }

  function renderLegend() {
    if (!legend) {
      return;
    }

    const sortedCategories = [...(data.categories || [])]
      .filter((cat) => (cat.count || 0) > 0)
      .sort((a, b) => (b.count || 0) - (a.count || 0));

    legend.innerHTML = sortedCategories
      .map(
        (cat) => `<div class="map-legend-item">
          <span class="map-legend-dot" style="background:${escapeHtml(cat.color || '#ffffff')}"></span>
          <span class="map-legend-text">
            <span class="map-legend-name">${escapeHtml(cat.name)}</span>
            <span class="map-legend-count">${cat.count} точек</span>
          </span>
        </div>`
      )
      .join('');
  }

  function updateSearchResults(rawQuery) {
    const query = rawQuery.trim();
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      currentResults = [];
      renderSearchResults([]);
      setSearchFeedback(`Точек на карте: ${points.length}`);
      return;
    }

    currentResults = points
      .filter((point) => point.searchLabel.includes(normalizedQuery))
      .sort((a, b) => {
        const aExact = normalize(a.ruName) === normalizedQuery ? 0 : 1;
        const bExact = normalize(b.ruName) === normalizedQuery ? 0 : 1;
        if (aExact !== bExact) {
          return aExact - bExact;
        }

        const aStarts = a.searchLabel.startsWith(normalizedQuery) ? 0 : 1;
        const bStarts = b.searchLabel.startsWith(normalizedQuery) ? 0 : 1;
        if (aStarts !== bStarts) {
          return aStarts - bStarts;
        }

        return a.ruName.localeCompare(b.ruName, 'ru');
      })
      .slice(0, 20);

    renderSearchResults(currentResults);

    if (currentResults.length === 0) {
      setSearchFeedback('Совпадений не найдено');
      return;
    }

    setSearchFeedback(`Найдено: ${currentResults.length} (показаны первые)`);
  }

  function renderSearchResults(foundPoints) {
    if (!searchResults) {
      return;
    }

    if (foundPoints.length === 0) {
      searchResults.innerHTML = '';
      return;
    }

    searchResults.innerHTML = foundPoints
      .map((point) => {
        const isActive = point.id === activePointId;
        return `<li class="map-result-item">
          <button type="button" class="map-result-btn ${isActive ? 'active' : ''}" data-point-id="${escapeHtml(point.id)}">
            <span class="map-result-name">${escapeHtml(point.ruName)}</span>
            <span class="map-result-meta">${escapeHtml(categoryName(point.category))}</span>
          </button>
        </li>`;
      })
      .join('');
  }

  function setSearchFeedback(message) {
    if (searchFeedback) {
      searchFeedback.textContent = message;
    }
  }

  function focusPoint(point, options = {}) {
    if (!point) {
      return;
    }

    const settings = {
      zoom: options.zoom ?? Math.max(map.getZoom(), 1.25),
      openPopup: options.openPopup ?? true,
      fly: options.fly ?? true,
    };

    setActivePoint(point.id);

    const targetLatLng = [point.y, point.x];
    if (settings.fly) {
      map.flyTo(targetLatLng, settings.zoom, {
        duration: 0.45,
      });
    } else {
      map.setView(targetLatLng, settings.zoom, {
        animate: false,
      });
    }

    const marker = markersById.get(point.id);
    if (marker && settings.openPopup) {
      marker.openPopup();
    }

    if (window.location.hash !== `#${point.id}`) {
      window.history.replaceState(null, '', `#${point.id}`);
    }

    if (searchInput) {
      searchInput.value = point.ruName;
    }

    renderSearchResults(currentResults);
    updateSelectedCard(point);
  }

  function setActivePoint(pointId) {
    if (activePointId === pointId) {
      return;
    }

    activePointId = pointId;
    refreshMarkerStyles();
  }

  function refreshMarkerStyles() {
    const zoom = map.getZoom();
    for (const [pointId, marker] of markersById.entries()) {
      const point = pointById.get(pointId);
      marker.setStyle(markerStyle(point.category, pointId === activePointId, zoom));
      if (pointId === activePointId) {
        marker.bringToFront();
      }
    }
  }

  function updateSelectedCard(point) {
    if (!selectedName || !selectedMeta) {
      return;
    }

    if (!point) {
      selectedName.textContent = 'Точка не выбрана';
      selectedMeta.textContent = 'Выберите локацию на карте';
      return;
    }

    selectedName.textContent = point.ruName;
    selectedMeta.textContent = categoryName(point.category);
  }

  function markerStyle(categoryId, isActive, zoom) {
    const baseColor = categoryMap.get(categoryId)?.color || '#ffffff';
    const radius = markerRadiusByZoom(zoom) + (isActive ? 1.8 : 0);

    return {
      radius,
      fillColor: baseColor,
      color: isActive ? '#fff5d2' : 'rgba(7, 5, 3, 0.95)',
      fillOpacity: isActive ? 1 : 0.9,
      opacity: 1,
      weight: isActive ? 2 : 1,
    };
  }

  function markerRadiusByZoom(zoom) {
    if (zoom <= -1.25) {
      return 2.1;
    }
    if (zoom <= -0.5) {
      return 2.8;
    }
    if (zoom <= 0.5) {
      return 3.6;
    }
    if (zoom <= 1.25) {
      return 4.3;
    }
    return 5.1;
  }

  function categoryName(categoryId) {
    return categoryMap.get(categoryId)?.name || 'Локация';
  }

  function updateTooltipScale() {
    const minZoom = -2;
    const maxZoom = 2.5;
    const minScale = 0.82;
    const maxScale = 1.2;

    const zoom = map.getZoom();
    const t = Math.min(1, Math.max(0, (zoom - minZoom) / (maxZoom - minZoom)));
    const scale = minScale + t * (maxScale - minScale);

    mapElement.style.setProperty('--tooltip-scale', scale.toFixed(3));
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
