// Function for tooltips
function popup() {
    let popup = null; // declare the popup variable

    function showPopup(event) {
        const feature = event.features[0];
        let priceDifference = feature.properties.PRICE_DIFFERENCE;

        let textColor;
        let formattedPriceDifference;

        if (priceDifference > 0) {
            textColor = '#EDA229'; // Color for positive numbers
            formattedPriceDifference = `+$${priceDifference}`;
        } else if (priceDifference < 0) {
            textColor = '#65AFFF'; // Color for negative numbers
            formattedPriceDifference = `-$${Math.abs(priceDifference)}`;
        } else {
            textColor = '#fafafa'; // Color for zero
            formattedPriceDifference = `$${priceDifference}`;
        }

        const fullBaths = feature.properties.NO_FULL_BATHS;
        const halfBaths = feature.properties.NO_HALF_BATHS;

        const totalBaths = fullBaths + (halfBaths / 2);

        const formattedTotalBaths = totalBaths % 1 === 0 ? totalBaths.toFixed(0) : totalBaths.toFixed(1);

        let popupContent = `
            <p style='font-size: 18px; color: #fafafa; background-color: #444; padding: 0 2px 0 2px; margin-bottom: 1px'>Change from list price: <span style="color: ${textColor}; font-weight: bold;">${formattedPriceDifference}</span</p>
                <div style="display: flex; justify-content: space-between;">
                    <p style="font-size: 16px; flex: 1; margin-right: 10px; margin-bottom: 0">List price:</p>
                    <p style="font-size: 16px; margin: 0;">$${feature.properties.LIST_PRICE}</p>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <p style="font-size: 16px; flex: 1; margin-right: 10px; margin-bottom: 0">Bedrooms:</p>
                    <p style="font-size: 16px; margin: 0;">${feature.properties.NO_BEDROOMS}</p>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <p style="font-size: 16px; flex: 1; margin-right: 10px; margin-bottom: 0">Bathrooms:</p>
                    <p style="font-size: 16px; margin: 0;">${formattedTotalBaths}</p>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <p style="font-size: 16px; flex: 1; margin-right: 10px; margin-bottom: 0">Square feet:</p>
                    <p style="font-size: 16px; margin: 0;">${feature.properties.SQUARE_FEET}</p>
                </div>
        `;

        // Create and set the popup content
        popup = new mapboxgl.Popup({
            offset: [0, -15],
            closeButton: false,
        })
            .setLngLat(feature.geometry.coordinates)
            .setHTML(popupContent)
            .addTo(map);
    }

    function hidePopup() {
        // Remove the popup when the user stops hovering over the marker.
        if (popup) {
            popup.remove();
            popup = null; // reset the popup variable
        }
    }

    // Attach event listeners for both mouseover and click/tap events
    map.on('mouseenter', 'rent-bidding-point-data-jitter', showPopup);

    map.on('click', 'rent-bidding-point-data-jitter', showPopup);

    map.on('mouseleave', 'rent-bidding-point-data-jitter', hidePopup);
}

// Function for legend creation and updating

function hideLegend() {
    d3.select('#legend').style('opacity', 0);
}

function updateLegend1() {
    const title = 'Percent of apartments bid up';
    const colors = ['#6ff6f6', '#05638f'];  // Define the start and end colors for the gradient

    d3.select('#legend').transition().duration(1000).style('opacity', 1);

    const legend = document.querySelector('#legend');

    // Remove the 'added' class and additional elements
    const legendTitle = legend.querySelector('.legend-title');
    legendTitle.classList.remove('added');

    const existingGradient = legend.querySelector('.legend-gradient');
    if (existingGradient) {
        existingGradient.remove();
    }

    const existingMarksContainer = legend.querySelector('.legend-marks');
    if (existingMarksContainer) {
        existingMarksContainer.remove();
    }

    const existingItemsContainer = legend.querySelector('.legend-items');
    if (existingItemsContainer) {
        existingItemsContainer.remove();
    }

    // Add 'added' class to the legend title if not already added
    if (!legendTitle.classList.contains('added')) {
        legendTitle.classList.add('added');
        legendTitle.textContent = title;

        // Create a container div for the gradient and marks
        const gradientMarksContainer = document.createElement('div');
        gradientMarksContainer.classList.add('gradient-marks-container');

        // Create a single element for the gradient
        const gradientElement = document.createElement('div');
        gradientElement.classList.add('legend-gradient');
        gradientElement.style.backgroundImage = `linear-gradient(to right, ${colors[0]}, ${colors[1]})`;
        gradientMarksContainer.appendChild(gradientElement);

        // Create a container for the marks
        const marksContainer = document.createElement('div');
        marksContainer.classList.add('legend-marks');

        // Add little numbers beneath the legend
        const marks = ['0%', '13%', '26%'];
        marks.forEach((mark, index) => {
            const markElement = document.createElement('div');
            markElement.classList.add('legend-mark');
            markElement.textContent = mark;
            if (index === 0) {
                markElement.style.textAlign = 'left';
            } else if (index === marks.length - 1) {
                markElement.style.textAlign = 'right';
            }
            marksContainer.appendChild(markElement);
        });

        gradientMarksContainer.appendChild(marksContainer);

        // wrap all legend items in one div
        const legendItemsDiv = document.createElement('div');
        legendItemsDiv.classList.add('legend-items');
        const newLegendItems = legend.querySelectorAll('.legend-item');
        newLegendItems.forEach(item => legendItemsDiv.appendChild(item));

        // Append the title, gradient, marks, and legend items container to the legend element
        legend.appendChild(legendTitle);
        legend.appendChild(gradientMarksContainer);
        legend.appendChild(legendItemsDiv);
    }
}




function updateLegend2() {
    const title = 'Percent increase from list price';
    const marks = ['0%', '4%', '8%']; // New marks for Legend 2

    const legend = document.querySelector('#legend');

    // Update legend title
    const legendTitle = legend.querySelector('.legend-title');
    legendTitle.textContent = title;

    // Update the marks
    const markElements = legend.querySelectorAll('.legend-mark');
    marks.forEach((mark, index) => {
        markElements[index].textContent = mark;
    });
}

var config = {
style: 'mapbox://styles/elijah-messmer/cln4vvc0x06wc01ns1l7m0b8m',
accessToken: 'pk.eyJ1IjoiZWxpamFoLW1lc3NtZXIiLCJhIjoiY2xuY2RscTZwMGZoZjJwc21hcmNsa2MzYiJ9.RLyE4QKOFzQEz9-SyExFmw',
showMarkers: false,
theme: 'dark',
use3dTerrain: false,
auto: false,


chapters: [
    {
        id: 'hidden-identifier',
        alignment: 'left',
        hidden: true,
        location: {
            center: [-71.13983, 42.33769],
            zoom: 11.00,
            pitch: 0.00,
            bearing: 0.00
        },
        mobileLocation: {
            center: [-71.07083, 42.33769],
            zoom: 10.00, // Adjusted zoom level for mobile
            pitch: 0.00,
            bearing: 0.00
        },
        mapAnimation: 'flyTo',
        rotateAnimation: false,
        callback: 'hideLegend',
        onChapterEnter: [
            {
                layer: 'percent-positive-price-difference',
                opacity: .0,
                duration: 1000
            }
        ],
        onChapterExit: []
    },
    {
        id: 'first-identifier',
        alignment: 'left',
        hidden: false,
        description: 'In the months leading up to Sept. 1, when the <a href="https://www.boston.gov/news/tips-residents-advance-september-1-move" target="_blank" style="color: inherit;"><span style="transition: color 0.3s;">the majority of Boston-area leases start</span></a>, 15% of all apartments were bid up from their list price across Boston, Brookline, Somerville and Cambridge, according to Multiple Listing Service records.',
        location: {
            center: [-71.13983, 42.33769],
            zoom: 11.00,
            pitch: 0.00,
            bearing: 0.00
        },
        mobileLocation: {
            center: [-71.07083, 42.33769],
            zoom: 10.00, // Adjusted zoom level for mobile
            pitch: 0.00,
            bearing: 0.00
        },
        mapAnimation: 'flyTo',
        rotateAnimation: false,
        callback: 'updateLegend1',
        onChapterEnter: [
            {
                layer: 'percent-positive-price-difference',
                opacity: .8,
                duration: 2000
            },
            {
                layer: 'rent-bidding-point-data-jitter',
                opacity: .8,
                duration: 2000
            },
        ],
        onChapterExit: []
    },
    {
        id: 'second-identifier',
        alignment: 'left',
        hidden: false,
        description: 'For that 15% of apartments, renters bid $177 over the asking price on average — more than $2,000 in additional rent over a 12-month lease.<br><br>Rent bidding is defined here by the difference between the list and the sale price of an apartment. This is the best available measurement for rent bidding, but it’s not perfect. The price difference of an apartment could be explained by something besides bidding, like someone paying extra for an optional parking spot.',
        location: {
            center: [-71.13983, 42.33769],
            zoom: 11.00,
            pitch: 0.00,
            bearing: 0.00
        },
        mobileLocation: {
            center: [-71.07083, 42.33769],
            zoom: 10.00, // Adjusted zoom level for mobile
            pitch: 0.00,
            bearing: 0.00
        },
        mapAnimation: 'flyTo',
        rotateAnimation: false,
        callback: 'popup',
        onChapterEnter: [],
        onChapterExit: []
    },
    {
        id: 'third-identifier',
        alignment: 'left',
        hidden: false,
        description: 'Stephanou and her partner, who landed an apartment on the Somerville-Cambridge line, were far from the only renters who bid above the asking price to secure their apartment.',
        location: {
            center: [-71.13609, 42.39992],
            zoom: 13.37,
            pitch: 0.00,
            bearing: 0.00
        },
        mobileLocation: {
            center: [-71.12109, 42.39992],
            zoom: 12.6,
            pitch: 0.00,
            bearing: 0.00
        },
        mapAnimation: 'flyTo',
        rotateAnimation: false,
        callback: '',
        onChapterEnter: [],
        onChapterExit: []
    },
    {
        id: 'fourth-identifier',
        alignment: 'left',
        hidden: false,
        description: 'In Stephanou’s 02144 ZIP Code, 20% of the apartments rented for above the asking price <svg height="20" width="20"><circle cx="10" cy="10" r="8" stroke="#873103" stroke-width="2" fill="#ff6224" /></svg>.',
        location: {
            center: [-71.13609, 42.39992],
            zoom: 13.37,
            pitch: 0.00,
            bearing: 0.00
        },
        mobileLocation: {
            center: [-71.12109, 42.39992],
            zoom: 12.6,
            pitch: 0.00,
            bearing: 0.00
        },
        mapAnimation: 'flyTo',
        rotateAnimation: false,
        callback: '',
        onChapterEnter: [
            {
                layer: '02144-highlight',
                opacity: .7,
                duration: 2000  
            }
        ],
        onChapterExit: [
            {
                layer: '02144-highlight',
                opacity: .0,
                duration: 2000  
            }
        ]
    },
    {
        id: 'fifth-identifier',
        alignment: 'left',
        hidden: false,
        description: 'Tom McCauley, a 27-year-old tech worker, found his apartment on that <span style="border-bottom: 1px dashed #fd1212; border-width: 3px">same Somerville-Cambridge line</span>. Before finding their current apartment, McCauley and his roommate inquired about 30-plus units across Fenway, East Somerville, and Watertown; toured six to seven apartments, and lost three bidding wars, often surrendering $25- to $50-dollar application fees.<br><br>At their new two-bedroom apartment, the two pay $3,000 a month plus utilities, after bidding up from the initial $2,875 list price.',
        location: {
            center: [-71.12609, 42.38692],
            zoom: 13.37,
            pitch: 0.00,
            bearing: 0.00
        },
        mobileLocation: {
            center: [-71.11209, 42.38692],
            zoom: 12.2,
            pitch: 0.00,
            bearing: 0.00
        },
        mapAnimation: 'flyTo',
        rotateAnimation: false,
        callback: '',
        onChapterEnter: [
            {
                layer: 'data-driven-lines',
                opacity: .8,
                duration: 2000  
            }
        ],
        onChapterExit: [
            {
                layer: 'data-driven-lines',
                opacity: 0,
                duration: 1000  
            }
        ]
    },
    {
        id: 'sixth-identifier',
        alignment: 'left',
        hidden: false,
        description: '“I’ve lived in the Boston area for 4 years,” McCauley said. “This is the first time I’ve ever experienced rent bidding. Some of my friends who have been here longer have also never experienced it, at least not at this scale.”',
        location: {
            center: [-71.12609, 42.38692],
            zoom: 13.37,
            pitch: 0.00,
            bearing: 0.00
        },
        mobileLocation: {
            center: [-71.11209, 42.38692],
            zoom: 12.2,
            pitch: 0.00,
            bearing: 0.00
        },
        mapAnimation: 'flyTo',
        rotateAnimation: false,
        callback: '',
        onChapterEnter: [],
        onChapterExit: []
    },
    {
        id: 'seventh-identifier',
        alignment: 'left',
        hidden: false,
        description: 'Across Somerville, the <a href="https://www.boston.com/real-estate/renting/2023/05/04/along-green-line-extension-bidding-wars-over-rentals-pick-up-speed/" target="_blank" style="text-decoration: none; color: inherit;"><span style="transition: color 0.3s; border-bottom: 1px dashed #00d62e; border-width: 3px">opening of the Green Line Extension stops</span></a> has driven up housing demand and costs driving above-average rates of rent bidding compared to nearby Cambridge and Boston.',
        location: {
            center: [-71.10449, 42.39043],
            zoom: 13.23,
            pitch: 0.00,
            bearing: 0.00
        },
        mobileLocation: {
            center: [-71.10049, 42.39043],
            zoom: 12.4,
            pitch: 0.00,
            bearing: 0.00
        },
        mapAnimation: 'flyTo',
        rotateAnimation: false,
        callback: '',
        onChapterEnter: [
            {
                layer: 'green-line-extension',
                opacity: .8,
                duration: 2000  
            }
        ],
        onChapterExit: [
            {
                layer: 'green-line-extension',
                opacity: 0,
                duration: 1000  
            }
        ]
    },
    {
        id: 'eighth-identifier',
        alignment: 'left',
        hidden: false,
        description: 'Although Somerville has a relatively high rate of rent bidding compared to other areas, it does not see as severe of bids as some nearby ZIP codes.',
        location: {
            center: [-71.10449, 42.39043],
            zoom: 13.23,
            pitch: 0.00,
            bearing: 0.00
        },
        mobileLocation: {
            center: [-71.10049, 42.39043],
            zoom: 12.4,
            pitch: 0.00,
            bearing: 0.00
        },
        mapAnimation: 'flyTo',
        rotateAnimation: false,
        callback: 'updateLegend1',
        onChapterEnter: [
            {
                layer: 'percent-positive-price-difference',
                opacity: .8,
                duration: 2000
            },
            {
                layer: 'percent-increase-by-zipcode',
                opacity: .0,
                duration: 1000
            }
        ],
        onChapterExit: []
    },
    {
        id: 'ninth-identifier',
        alignment: 'left',
        hidden: false,
        description: 'Neighborhoods like Chinatown, Roslindale, Dorchester and Roxbury saw some of the highest bidding. On average, apartments that were bid on in these neighborhoods went for 7% to 8% above the list price.',
        location: {
            center: [-71.13983, 42.33769],
            zoom: 11.00,
            pitch: 0.00,
            bearing: 0.00
        },
        mobileLocation: {
            center: [-71.07083, 42.33769],
            zoom: 10.00, // Adjusted zoom level for mobile
            pitch: 0.00,
            bearing: 0.00
        },
        mapAnimation: 'flyTo',
        rotateAnimation: false,
        callback: 'updateLegend2',
        onChapterEnter: [
            {
                layer: 'high-percent-increase',
                opacity: .7,
                duration: 2000  
            },
            {
                layer: 'percent-increase-by-zipcode',
                opacity: .8,
                duration: 2000
            },
            {
                layer: 'percent-positive-price-difference',
                opacity: .0,
                duration: 2000
            },
        ],
        onChapterExit: [
            {
                layer: 'high-percent-increase',
                opacity: .0,
                duration: 1000  
            },
        ]
    },
    {
        id: 'tenth-identifier',
        alignment: 'left',
        hidden: false,
        description: 'Boston’s rental housing supply has lagged demand for years, but agents say the phenomenon of rent bidding emerged at this scale only after the city began its recovery from the pandemic.',
        location: {
            center: [-71.13983, 42.33769],
            zoom: 11.00,
            pitch: 0.00,
            bearing: 0.00
        },
        mobileLocation: {
            center: [-71.07083, 42.33769],
            zoom: 10.00, // Adjusted zoom level for mobile
            pitch: 0.00,
            bearing: 0.00
        },
        mapAnimation: 'flyTo',
        rotateAnimation: false,
        callback: '',
        onChapterEnter: [],
        onChapterExit: []
    },
]
};
