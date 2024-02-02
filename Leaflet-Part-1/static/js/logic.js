// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
// Once we get a response, send the data.features object to the createFeatures function.
createFeatures(data.features);
console.log(data.features);
});

function createFeatures(earthquakeData) {
// Define a function that we want to run once for each feature in the features array.
// Give each feature a popup that describes the place and time of the earthquake.
function onEachFeature(feature, layer) {
layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)} <hr><li>Magnitude: ${feature.properties.mag} <li>Depth: ${feature.geometry.coordinates[2]}`);
}

// Define a function to create the circle markers for the earthquakes.
function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng, {
    radius: feature.properties.mag * 5,
    fillColor: "red",
    color: "black",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
    });
    }

// Define a function to choose the color of the marker based on the depth of the earthquake.
function chooseColor(depth) {
    if (depth > 5) {
        return "red";
    } else if (depth > 4) {
        return "orange";
    } else if (depth > 3) {
        return "yellow";
    } else if (depth > 2) {
        return "green";
    } else if (depth > 1) {
        return "blue";
    } else {
        return "purple";
    }
    
}


// Create a GeoJSON layer that contains the features array on the earthquakeData object.
// Run the onEachFeature function once for each piece of data in the array.
let earthquakes = L.geoJSON(earthquakeData, {
onEachFeature: onEachFeature,
pointToLayer: pointToLayer,
style: function (feature) {
    return {
        // Call the chooseColor function to decide which color to make the circle based on the depth of the earthquake.
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.8,
        weight: 0.5
    };
}
});

// Send our earthquakes layer to the createMap function/
createMap(earthquakes);

}

// Create the createMap function.
function createMap(earthquakes) {

// Create the base layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create a baseMaps object.
let baseMaps = {
"Street Map": street,
"Topographic Map": topo
};

// Create an overlay object to hold our overlay.
let overlayMaps = {
Earthquakes: earthquakes
};

// Create our map, giving it the streetmap and earthquakes layers to display on load.
let myMap = L.map("map", {
center: [
    37.09, -95.71
],
zoom: 5,
layers: [street, earthquakes]
});

// Create a layer control.
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
collapsed: false
}).addTo(myMap);

// Create a legend to display information about our map.
let legend = L.control({
position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend".
legend.onAdd = function () {
let div = L.DomUtil.create("div", "legend");
let depth = [-1, 1, 2, 3, 4, 5];
let colors = [
    "purple",
    "blue",
    "green",
    "yellow",
    "orange",
    "red"
];

// Loop through our depth intervals and generate a label with a colored square for each interval.
for (let i = 0; i < depth.length; i++) {
    // Construct a verical legend with colors and depth intervals.
    div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        depth[i] + (depth[i + 1] ? "&ndash;" + depth[i + 1] + "<br>" : "+");
}
return div;
};

// Add the info legend to the map.
legend.addTo(myMap);
}
