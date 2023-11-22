// Start code for scrollytelling map
var initLoad = true;
var layerTypes = {
    'fill': ['fill-opacity'],
    'line': ['line-opacity'],
    'circle': ['circle-opacity', 'circle-stroke-opacity'],
    'symbol': ['icon-opacity', 'text-opacity'],
    'raster': ['raster-opacity'],
    'fill-extrusion': ['fill-extrusion-opacity'],
    'heatmap': ['heatmap-opacity']
}

var alignments = {
    'left': 'lefty',
    'center': 'centered',
    'right': 'righty',
    'full': 'fully'
}

function getLayerPaintType(layer) {
    var layerType = map.getLayer(layer).type;
    return layerTypes[layerType];
}

function setLayerOpacity(layer) {
    var paintProps = getLayerPaintType(layer.layer);
    paintProps.forEach(function(prop) {
        var options = {};
        if (layer.duration) {
            var transitionProp = prop + "-transition";
            options = { "duration": layer.duration };
            map.setPaintProperty(layer.layer, transitionProp, options);
        }
        map.setPaintProperty(layer.layer, prop, layer.opacity, options);
    });
}

var story = document.getElementById('story');
var features = document.createElement('div');
features.setAttribute('id', 'features');

var header = document.createElement('div');

if (config.title) {
    var titleText = document.createElement('h1');
    titleText.innerText = config.title;
    header.appendChild(titleText);
}

if (config.subtitle) {
    var subtitleText = document.createElement('h2');
    subtitleText.innerText = config.subtitle;
    header.appendChild(subtitleText);
}

if (config.byline) {
    var bylineText = document.createElement('p');
    bylineText.innerText = config.byline;
    header.appendChild(bylineText);
}

if (header.innerText.length > 0) {
    header.classList.add(config.theme);
    header.setAttribute('id', 'header');
    story.appendChild(header);
}

config.chapters.forEach((record, idx) => {
    var container = document.createElement('div');
    var chapter = document.createElement('div');

    if (record.title) {
        var title = document.createElement('h3');
        title.innerText = record.title;
        chapter.appendChild(title);
    }

    if (record.image) {
        var image = new Image();
        image.src = record.image;
        chapter.appendChild(image);
    }

    if (record.description) {
        var story = document.createElement('p');
        story.innerHTML = record.description;
        chapter.appendChild(story);
    }

    container.setAttribute('id', record.id);
    container.classList.add('step');
    if (idx === 0) {
        container.classList.add('active');
    }

    chapter.classList.add(config.theme);
    container.appendChild(chapter);
    container.classList.add(alignments[record.alignment] || 'centered');
    if (record.hidden) {
        container.classList.add('hidden');
    }
    features.appendChild(container);
});

story.appendChild(features);

var footer = document.createElement('div');

if (config.footer) {
    var footerText = document.createElement('p');
    footerText.innerHTML = config.footer;
    footer.appendChild(footerText);
}

if (footer.innerText.length > 0) {
    footer.classList.add(config.theme);
    footer.setAttribute('id', 'footer');
    story.appendChild(footer);
}

mapboxgl.accessToken = config.accessToken;

const transformRequest = (url) => {
    const hasQuery = url.indexOf("?") !== -1;
    const suffix = hasQuery ? "&pluginName=scrollytellingV2" : "?pluginName=scrollytellingV2";
    return {
        url: url + suffix
    }
}

var zoomVar = window.innerWidth <= 767 ? 10.00 : 11.00;

var centerVar = window.innerWidth <= 767 ? [-71.07083, 42.33769] : [-71.13983, 42.33769];


var map = new mapboxgl.Map({
    container: 'map',
    style: config.style,
    center: centerVar,
    zoom: zoomVar,
    bearing: config.chapters[0].location.bearing,
    pitch: config.chapters[0].location.pitch,
    interactive: false,
    transformRequest: transformRequest,
    projection: config.projection
});

// Create a inset map if enabled in config.js
if (config.inset) {
    var insetMap = new mapboxgl.Map({
    container: 'mapInset', // container id
    style: 'mapbox://styles/mapbox/dark-v10', //hosted style id
    center: config.chapters[0].location.center,
    // Hardcode above center value if you want insetMap to be static.
    zoom: 3, // starting zoom
    hash: false,
    interactive: false,
    attributionControl: false,
    //Future: Once official mapbox-gl-js has globe view enabled,
    //insetmap can be a globe with the following parameter.
    //projection: 'globe'
    });
}

if (config.showMarkers) {
    var marker = new mapboxgl.Marker({ color: config.markerColor });
    marker.setLngLat(config.chapters[0].location.center).addTo(map);
}

// instantiate the scrollama
var scroller1 = scrollama();


map.on("load", function() {
    if (config.use3dTerrain) {
        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });
        // add the DEM source as a terrain layer with exaggerated height
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

        // add a sky layer that will show when the map is highly pitched
        map.addLayer({
            'id': 'sky',
            'type': 'sky',
            'paint': {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun': [0.0, 0.0],
                'sky-atmosphere-sun-intensity': 15
            }
        });
    };

    // As the map moves, grab and update bounds in inset map.
    if (config.inset) {
    map.on('move', getInsetBounds);
    }
    // setup the instance, pass callback functions
    scroller1
    .setup({
        step: '.step',
        offset: 0.5,
        progress: true
    })
    .onStepEnter(async response => {
        var current_chapter = config.chapters.findIndex(chap => chap.id === response.element.id);
        var chapter = config.chapters[current_chapter];
        
        var location = window.innerWidth <= 767 ? chapter.mobileLocation : chapter.location;

        response.element.classList.add('active');
        map[chapter.mapAnimation || 'flyTo'](location);

        // Incase you do not want to have a dynamic inset map,
        // rather want to keep it a static view but still change the
        // bbox as main map move: comment out the below if section.
        if (config.inset) {
            if (chapter.location.zoom < 5) {
            insetMap.flyTo({center: chapter.location.center, zoom: 0});
            }
            else {
            insetMap.flyTo({center: chapter.location.center, zoom: 3});
            }
        }
        if (config.showMarkers) {
            marker.setLngLat(chapter.location.center);
        }
        if (chapter.onChapterEnter.length > 0) {
            chapter.onChapterEnter.forEach(setLayerOpacity);
        }
        if (chapter.callback) {
            window[chapter.callback]();
        }
        if (chapter.rotateAnimation) {
            map.once('moveend', () => {
                const rotateNumber = map.getBearing();
                map.rotateTo(rotateNumber + 180, {
                    duration: 30000, easing: function (t) {
                        return t;
                    }
                });
            });
        }
        if (config.auto) {
                var next_chapter = (current_chapter + 1) % config.chapters.length;
                map.once('moveend', () => {
                    document.querySelectorAll('[data-scrollama-index="' + next_chapter.toString() + '"]')[0].scrollIntoView();
                });
        }
    })
    .onStepExit(response => {
        var chapter = config.chapters.find(chap => chap.id === response.element.id);
        response.element.classList.remove('active');
        if (chapter.onChapterExit.length > 0) {
            chapter.onChapterExit.forEach(setLayerOpacity);
        }
    });


    if (config.auto) {
        document.querySelectorAll('[data-scrollama-index="0"]')[0].scrollIntoView();
    }
});

//Helper functions for insetmap
function getInsetBounds() {
            let bounds = map.getBounds();

            let boundsJson = {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [
                                    bounds._sw.lng,
                                    bounds._sw.lat
                                ],
                                [
                                    bounds._ne.lng,
                                    bounds._sw.lat
                                ],
                                [
                                    bounds._ne.lng,
                                    bounds._ne.lat
                                ],
                                [
                                    bounds._sw.lng,
                                    bounds._ne.lat
                                ],
                                [
                                    bounds._sw.lng,
                                    bounds._sw.lat
                                ]
                            ]
                        ]
                    }
                }]
            }

            if (initLoad) {
                addInsetLayer(boundsJson);
                initLoad = false;
            } else {
                updateInsetLayer(boundsJson);
            }

        }

function addInsetLayer(bounds) {
    insetMap.addSource('boundsSource', {
        'type': 'geojson',
        'data': bounds
    });

    insetMap.addLayer({
        'id': 'boundsLayer',
        'type': 'fill',
        'source': 'boundsSource', // reference the data source
        'layout': {},
        'paint': {
            'fill-color': '#fff', // blue color fill
            'fill-opacity': 0.2
        }
    });
    // // Add a black outline around the polygon.
    insetMap.addLayer({
        'id': 'outlineLayer',
        'type': 'line',
        'source': 'boundsSource',
        'layout': {},
        'paint': {
            'line-color': '#000',
            'line-width': 1
        }
    });
}

function updateInsetLayer(bounds) {
    insetMap.getSource('boundsSource').setData(bounds);
}



// setup resize event
window.addEventListener('resize', scroller1.resize);












// Start code for explorable
// document.addEventListener('DOMContentLoaded', function() {
//     mapboxgl.accessToken = 'pk.eyJ1IjoiZWxpamFoLW1lc3NtZXIiLCJhIjoiY2xuY2RscTZwMGZoZjJwc21hcmNsa2MzYiJ9.RLyE4QKOFzQEz9-SyExFmw';
//     const map2 = new mapboxgl.Map({
//         container: 'dashboard',
//         style: 'mapbox://styles/elijah-messmer/cln4vvc0x06wc01ns1l7m0b8m',
//         center: centerVar,
//         zoom: zoomVar,
//     });

//     map2.scrollZoom.disable();
//     map2.dragPan.disable();

//     function updateLegend1_1() {
//     const title = 'Percent of apartments bid up';
//     const colors = ['#6ff6f6', '#05638f'];  // Define the start and end colors for the gradient

//     d3.select('#legend2').transition().duration(1000).style('opacity', 1);

//     const legend = document.querySelector('#legend2');

//     const legendTitle = legend.querySelector('.legend-title2');
//     legendTitle.textContent = title;

//     const existingContainer = legend.querySelector('.gradient-marks-container');
//     if (existingContainer) {
//         // Update the marks only if the container exists
//         const marksContainer = existingContainer.querySelector('.legend-marks');
//         marksContainer.innerHTML = ''; // Clear existing marks
//         const marks = ['0%', '13%', '26%'];
//         marks.forEach((mark, index) => {
//             const markElement = document.createElement('div');
//             markElement.classList.add('legend-mark');
//             markElement.textContent = mark;
//             if (index === 0) {
//                 markElement.style.textAlign = 'left';
//             } else if (index === marks.length - 1) {
//                 markElement.style.textAlign = 'right';
//             }
//             marksContainer.appendChild(markElement);
//         });
//     } else {
//         // If container doesn't exist, create and append it
//         const gradientMarksContainer = document.createElement('div');
//         gradientMarksContainer.classList.add('gradient-marks-container');
//         gradientMarksContainer.innerHTML = `
//             <div class="legend-title2 added">${title}</div>
//             <div class="legend-gradient" style="background-image: linear-gradient(to right, ${colors[0]}, ${colors[1]})"></div>
//             <div class="legend-marks"></div>
//         `;

//         const marksContainer = gradientMarksContainer.querySelector('.legend-marks');
//         const marks = ['0%', '13%', '26%'];
//         marks.forEach((mark, index) => {
//             const markElement = document.createElement('div');
//             markElement.classList.add('legend-mark');
//             markElement.textContent = mark;
//             if (index === 0) {
//                 markElement.style.textAlign = 'left';
//             } else if (index === marks.length - 1) {
//                 markElement.style.textAlign = 'right';
//             }
//             marksContainer.appendChild(markElement);
//         });

//         // wrap all legend items in one div
//         const legendItemsDiv = document.createElement('div');
//         legendItemsDiv.classList.add('legend-items');
//         const newLegendItems = legend.querySelectorAll('.legend-item');
//         newLegendItems.forEach(item => legendItemsDiv.appendChild(item));

//         // Append the title, gradient, marks, and legend items container to the legend element
//         legend.innerHTML = ''; // Clear existing content
//         legend.appendChild(gradientMarksContainer);
//         legend.appendChild(legendItemsDiv);
//     }
// }


// function updateLegend2_2() {
//     const title = 'Percent increase from list price';
//     const marks = ['0%', '4%', '8%']; // New marks for Legend 2

//     const legend = document.querySelector('#legend2');

//     // Update legend title
//     const legendTitle = legend.querySelector('.legend-title2');
//     legendTitle.textContent = title;

//     // Update the marks
//     const markElements = legend.querySelectorAll('.legend-mark');
//     marks.forEach((mark, index) => {
//         markElements[index].textContent = mark;
//     });
// }

//     // Function for tooltips
//     function popup() {
//         let popup = null; // declare the popup variable

//         function showPopup(event) {
//             const feature = event.features[0];
//             let priceDifference = feature.properties.PRICE_DIFFERENCE;

//             let textColor;
//             let formattedPriceDifference;

//             if (priceDifference > 0) {
//                 textColor = '#EDA229'; // Color for positive numbers
//                 formattedPriceDifference = `+$${priceDifference}`;
//             } else if (priceDifference < 0) {
//                 textColor = '#65AFFF'; // Color for negative numbers
//                 formattedPriceDifference = `-$${Math.abs(priceDifference)}`;
//             } else {
//                 textColor = '#fafafa'; // Color for zero
//                 formattedPriceDifference = `$${priceDifference}`;
//             }

//             const fullBaths = feature.properties.NO_FULL_BATHS;
//             const halfBaths = feature.properties.NO_HALF_BATHS;

//             const totalBaths = fullBaths + (halfBaths / 2);

//             const formattedTotalBaths = totalBaths % 1 === 0 ? totalBaths.toFixed(0) : totalBaths.toFixed(1);

//             let popupContent = `
//                 <p style='font-size: 18px; color: #fafafa; background-color: #444; padding: 0 2px 0 2px; margin-bottom: 1px'>Change from list price: <span style="color: ${textColor}; font-weight: bold;">${formattedPriceDifference}</span</p>
//                     <div style="display: flex; justify-content: space-between;">
//                         <p style="font-size: 16px; flex: 1; margin-right: 10px; margin-bottom: 0">List price:</p>
//                         <p style="font-size: 16px; margin: 0;">$${feature.properties.LIST_PRICE}</p>
//                     </div>
//                     <div style="display: flex; justify-content: space-between;">
//                         <p style="font-size: 16px; flex: 1; margin-right: 10px; margin-bottom: 0">Bedrooms:</p>
//                         <p style="font-size: 16px; margin: 0;">${feature.properties.NO_BEDROOMS}</p>
//                     </div>
//                     <div style="display: flex; justify-content: space-between;">
//                         <p style="font-size: 16px; flex: 1; margin-right: 10px; margin-bottom: 0">Bathrooms:</p>
//                         <p style="font-size: 16px; margin: 0;">${formattedTotalBaths}</p>
//                     </div>
//                     <div style="display: flex; justify-content: space-between;">
//                         <p style="font-size: 16px; flex: 1; margin-right: 10px; margin-bottom: 0">Square feet:</p>
//                         <p style="font-size: 16px; margin: 0;">${feature.properties.SQUARE_FEET}</p>
//                     </div>
//             `;

//             // Create and set the popup content
//             popup = new mapboxgl.Popup({
//                 offset: [0, -15],
//                 closeButton: false,
//             })
//                 .setLngLat(feature.geometry.coordinates)
//                 .setHTML(popupContent)
//                 .addTo(map2);
//         }

//         function hidePopup() {
//             // Remove the popup when the user stops hovering over the marker.
//             if (popup) {
//                 popup.remove();
//                 popup = null; // reset the popup variable
//             }
//         }

//         // Attach event listeners for both mouseover and click/tap events
//         map2.on('mouseenter', 'rent-bidding-point-data-jitter', showPopup);

//         map2.on('click', 'rent-bidding-point-data-jitter', showPopup);

//         map2.on('mouseleave', 'rent-bidding-point-data-jitter', hidePopup);
//     }


//     function animateZipInfo() {
//         const zipInfo = document.getElementById('zipInfo');
//         zipInfo.style.transform = 'translateX(-100%)';
//         zipInfo.style.visibility = 'visible';
//         zipInfo.style.transition = 'transform 0.5s ease';
//         setTimeout(() => {
//             zipInfo.style.transform = 'translateX(0)';
//         }, 10);
//         const additionalStats = document.getElementById('additionalStats');
//         additionalStats.style.display = 'none';
//         const showMoreBtn = document.getElementById('showMoreButton')
//         const buttonText = showMoreBtn.querySelector('.button-text');
//         buttonText.innerText = 'View more data';
//         buttonText.setAttribute('data-text', 'show-more');
//         document.querySelector('.autocomplete').style.display = 'none';
//     }

//     function reverseAnimateZipInfo() {
//         const zipInfo = document.getElementById('zipInfo');
//         zipInfo.style.transform = 'translateX(0)';
//         zipInfo.style.transition = 'transform 0.5s ease';
//         zipInfo.style.transform = 'translateX(-100%)';
//         setTimeout(() => {
//             zipInfo.style.visibility = 'hidden'
//         }, 250);


//     }

//                     // Update the content of the zipInfo elements
//                 // Assign all stats to variables for ease
//                 stat0 = document.getElementById('zipCode');
//                 stat1 = document.getElementById('stat1');
//                 stat2 = document.getElementById('stat2');
//                 stat3 = document.getElementById('stat3');
//                 stat4 = document.getElementById('stat4');
//                 stat5 = document.getElementById('stat5');
//                 stat6 = document.getElementById('stat6');
//                 stat7 = document.getElementById('stat7');
//                 stat8 = document.getElementById('stat8');
//                 stat9 = document.getElementById('stat9');
//                 stat10 = document.getElementById('stat10');
//                 stat11 = document.getElementById('stat11');
//                 stat12 = document.getElementById('stat12');
//                 stat13 = document.getElementById('stat13');
//                 stat14 = document.getElementById('stat14');
//                 stat15 = document.getElementById('stat15');
//                 stat16 = document.getElementById('stat16');
//                 stat17 = document.getElementById('stat17');
//                 stat18 = document.getElementById('stat18');
//                 stat19 = document.getElementById('stat19');
//                 city1 = document.getElementById('city1');
//                 city2 = document.getElementById('city2');
//                 city3 = document.getElementById('city3');
//                 studentPop = document.getElementById('studentPop');

//                 async function updateStats() {
//                 // You can now use the cached data in this function
//                 let filteredFeatures = cache.features.filter(feature => feature.properties['POSTCODE'] === selectedZipCode);
//                         filteredFeatures.forEach(feature => {
//                             value0 = feature.properties['POSTCODE'];
//                             value1 = feature.properties['PERCENT_PRICE_DIFFERENCE'];
//                             value2 = feature.properties['PERCENT_DIFFERENCE'];
//                             value3 = feature.properties['MAX_PERCENT'];
//                             value4 = feature.properties['MIN_PERCENT'];
//                             value5 = feature.properties['RAW_DIFFERENCE'];
//                             value6 = feature.properties['MAX_DIFFERENCE'].toLocaleString();
//                             value7 = feature.properties['MIN_DIFFERENCE'];
//                             value8 = feature.properties['DIFF_FROM_CITY_PERCENT_SHARE'];
//                             value9 = feature.properties['DIFF_FROM_CITY_PERCENT'];
//                             value10 = feature.properties['DIFF_FROM_CITY_RAW'];
//                             value11 = (!isNaN(parseInt(feature.properties['POPULATION'].replace(/,/g, ''), 10)) ? (parseInt(feature.properties['POPULATION'].replace(/,/g, ''), 10) / 1000).toFixed(1) : 0);
//                             value12 = feature.properties['STUDENTS_POP'];
//                             value13 = feature.properties['PERCENT_POVERTY'];
//                             value14 = ((feature.properties['MEDIAN_INCOME'] / 1000).toFixed(1));
//                             value15 = feature.properties['BLACK'];
//                             value16 = feature.properties['LATINO'];
//                             value17 = feature.properties['WHITE'];
//                             value18 = feature.properties['ASIAN'];
//                             value19 = feature.properties['TWO_OR_MORE_RACES'];
//                             value20 = feature.properties['CITY'];

//                             stat0.innerHTML = `0${value0}`;
//                             stat1.innerHTML = `${value1}%`;
//                             stat2.innerHTML = `${value2}%`;
//                             stat3.innerHTML = `Max: ${value3}%`;
//                             stat4.innerHTML = `Min: ${value4}%`;
//                             stat5.innerHTML = `$${value5}`;
//                             stat6.innerHTML = `Max: $${value6}`;
//                             stat7.innerHTML = `Min: $${value7}`;
//                             stat11.innerHTML = `${value11}K`;
//                             stat12.innerHTML = value12;
//                             stat13.innerHTML = `${value13}%`;
//                             stat14.innerHTML = `$${value14}K`;
//                             stat15.innerHTML = value15;
//                             stat16.innerHTML = value16;
//                             stat17.innerHTML = value17;
//                             stat18.innerHTML = value18;
//                             stat19.innerHTML = value19;
//                             if (value8 < 0) {
//                                 city1.innerHTML = `<span style="color: #7A7A7A">${value8}%</span> ${value20} average`;
//                             } else {
//                                 city1.innerHTML = `<span style="color: #FBB225">+${value8}%</span> ${value20} average`;
//                             }
//                             if (value9 < 0) {
//                                 city2.innerHTML = `<span style="color: #7A7A7A">${value9}%</span> ${value20} average`;
//                             } else {
//                                 city2.innerHTML = `<span style="color: #FBB225">+${value9}%</span> ${value20} average`;
//                             }
//                             if (value10 < 0) {
//                                 city3.innerHTML = `<span style="color: #7A7A7A">$${value10}</span> ${value20} average`;
//                             } else {
//                                 city3.innerHTML = `<span style="color: #FBB225">+$${value10}</span> ${value20} average`;
//                             }
//                             if (value20 != 'Boston' || value12 === '') {
//                                 studentPop.style.display = 'none';
//                             } else {
//                                 studentPop.style.display = 'flex';
//                             }
//                         });
//                     };

//     function zoomToLocation(coordinates) {
//         map2.flyTo({
//             center: [coordinates[0] - 0.01, coordinates[1]],
//             zoom: 13,
//             speed: 1.5
//         });
//     }

//     function geocodeZipCode(zipCode) {
//         const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${zipCode}.json?access_token=${mapboxgl.accessToken}`;

//         return fetch(apiUrl)
//             .then(response => response.json())
//             .then(data => {
//                 const coordinates = data.features[0].center;
//                 return coordinates;
//             });
//     }

//     document.getElementById('zipInput').addEventListener('change', function() {
//         var zipCode = this.value;

//         geocodeZipCode(zipCode).then(function(coordinates) {
//             zoomToLocation(coordinates);
//         });
//     });

//     const zipList = document.getElementById('zipList');
//     const zipInput = document.getElementById('zipInput');
//     const zipCodes = [
//         '02134', '02125', '02110', '02118', '02126', '02109', '02113', '02130', '02121', '02119',
//         '02115', '02163', '02135', '02199', '02124', '02132', '02114', '02108', '02136', '02111',
//         '02210', '02116', '02131', '02127', '02120', '02203', '02215', '02129', '02128', '02122',
//         '02151', '02467', '02445', '02446', '02447', '02467', '02141', '02142', '02139', '02138',
//         '02140', '02143', '02144', '02145'
//     ];

//     zipInput.addEventListener('input', function() {
//         const searchTerm = this.value.toLowerCase();
//         const matchingZipCodes = zipCodes.filter(zipCode => zipCode.includes(searchTerm));
//         renderAutocompleteList(matchingZipCodes);
//     });

//     function renderAutocompleteList(zipCodes) {
//     zipList.innerHTML = '';
//     zipList.style.display = 'block';

//     if (zipCodes.length > 0) {
//         zipCodes.forEach(zipCode => {
//             const listItem = document.createElement('li');
//             listItem.textContent = zipCode;
//             listItem.addEventListener('click', function() {
//                 geocodeZipCode(zipCode).then(function(coordinates) {
//                     zoomToLocation(coordinates);
//                 });
//                 zipInput.value = zipCode;
//                 zipList.style.display = 'none';
//                 // Animate the zip info div
//                 animateZipInfo();
                
//                 selectedZipCode = parseInt(zipCode);

//                 // Set the opacity of the zip code outline layer to 1 for the selected zip code
//                 map2.setPaintProperty('zipOutline', 'line-opacity', [
//                     'case',
//                     ['==', ['get', 'POSTCODE'], selectedZipCode],
//                     1,
//                     0
//                 ]);

//                 map2.scrollZoom.enable();
//                 map2.dragPan.enable();
//                 updateStats();
//             });
//             zipList.appendChild(listItem);
//         });
//     } else {
//         zipList.style.display = 'none';
//     }

//     // Add keyup event listener to zipInput
//     document.getElementById('zipInput').addEventListener('keyup', function(event) {
//         if (event.key === 'Enter') {
//             animateZipInfo();
//             const zipCode = zipInput.value;
//             selectedZipCode = parseInt(zipCode);
//             map2.setPaintProperty('zipOutline', 'line-opacity', [
//                     'case',
//                     ['==', ['get', 'POSTCODE'], selectedZipCode],
//                     1,
//                     0
//                 ]);
//             map2.scrollZoom.enable();
//             map2.dragPan.enable();
//             updateStats();
//         }
//     });
// }

//     document.getElementById('zipInput').addEventListener('input', function() {
//     if (getComputedStyle(zipInfo).visibility === 'visible') {
//         reverseAnimateZipInfo();
//         map2.setPaintProperty('zipOutline', 'line-opacity', 0);
//     }
//     });


//     document.addEventListener('click', function(event) {
//         if (!zipList.contains(event.target) && event.target !== zipInput) {
//             zipList.style.display = 'none';
//         }
//     });

//     document.querySelectorAll('.toggle-button').forEach(function(button) {
//             button.addEventListener('click', function() {
//                 const selectedValue = this.getAttribute('data-value');

//                 // Remove 'active' class from all buttons
//                 document.querySelectorAll('.toggle-button').forEach(function(btn) {
//                     btn.classList.remove('active');
//                 });

//                 // Add 'active' class to the clicked button
//                 this.classList.add('active');

//                 // Handle selected value
//                 if (selectedValue === 'layer1') {
//                     map2.setPaintProperty('percent-positive-price-difference', 'fill-opacity', 0.8);
//                     map2.setPaintProperty('percent-increase-by-zipcode', 'fill-opacity', 0);
//                     updateLegend1_1();
//                 } else if (selectedValue === 'layer2') {
//                     map2.setPaintProperty('percent-increase-by-zipcode', 'fill-opacity', 0.8);
//                     map2.setPaintProperty('percent-positive-price-difference', 'fill-opacity', 0);
//                     updateLegend2_2();
//                 }
//             });
//         });

// document.getElementById('showMoreButton').addEventListener('click', function() {
//     const additionalStats = document.getElementById('additionalStats');
//     const buttonText = this.querySelector('.button-text');
    
//     if (additionalStats.style.display === 'none') {
//         additionalStats.style.display = 'block';
//         buttonText.innerText = 'Show Less';
//         buttonText.setAttribute('data-text', 'show-less');
//         additionalStats.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
//     } else {
//         additionalStats.style.display = 'none';
//         buttonText.innerText = 'View more data';
//         buttonText.setAttribute('data-text', 'show-more');
//     }
// });




// let cache = null;

// map2.on('load', async function() {
//     // This code will run once the style has fully loaded
//     map2.setPaintProperty('percent-positive-price-difference', 'fill-opacity', 0.8);
//     map2.setPaintProperty('rent-bidding-point-data-jitter', 'circle-opacity', 0.8);
//     map2.setPaintProperty('rent-bidding-point-data-jitter', 'circle-stroke-opacity', 0.8);
//     popup();
//     updateLegend1_1();
//     document.querySelector('.toggle-button[data-value="layer1"]').classList.add('active');

//     // Fetch and cache data
//     if (!cache) {
//         cache = await fetch('https://api.mapbox.com/datasets/v1/elijah-messmer/clp4mth2113ih1mqdg2ay0nmi/features?access_token=pk.eyJ1IjoiZWxpamFoLW1lc3NtZXIiLCJhIjoiY2xuY2RscTZwMGZoZjJwc21hcmNsa2MzYiJ9.RLyE4QKOFzQEz9-SyExFmw')
//             .then(response => response.json());
//     }
//     });

//     document.getElementById('closeButton').addEventListener('click', function() {
//         reverseAnimateZipInfo();
//         map2.setPaintProperty('zipOutline', 'line-opacity', 0);
//     });

// });