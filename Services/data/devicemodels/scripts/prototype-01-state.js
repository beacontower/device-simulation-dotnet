// Copyright (c) Microsoft. All rights reserved.

/*global log*/
/*global updateState*/
/*global updateProperty*/
/*global sleep*/
/*jslint node: true*/

"use strict";

var center_latitude = 47.612514;
var center_longitude = -122.204184;

// Default state
var state = {
    online: true,
    temperature: 65.0,
    temperature_unit: "F",
    pressure: 150.0,
    pressure_unit: "psig",
    latitude: center_latitude,
    longitude: center_longitude,
    moving: false
};

// Default device properties
var properties = {};

/**
 * Restore the global state using data from the previous iteration.
 *
 * @param previousState device state from the previous iteration
 * @param previousProperties device properties from the previous iteration
 */
function restoreSimulation(previousState, previousProperties) {
    // If the previous state is null, force a default state
    if (previousState) {
        state = previousState;
    } else {
        log("Using default state");
    }

    if (previousProperties) {
        properties = previousProperties;
    } else {
        log("Using default properties");
    }
}

/**
 * Simple formula generating a random value around the average
 * in between min and max
 *
 * @returns random value with given parameters
 */
function vary(avg, percentage, min, max) {
    var value = avg * (1 + ((percentage / 100) * (2 * Math.random() - 1)));
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value;
}

/**
 * Ensure that a value is within a specified range
 * 
 * @returns 'value' parameter guarnteed to be within 'min' and 'max' values
 */
function ensureRange(value, min, max) {
    if (value < min) {
        value = min;
    } else if (value > max) {
        value = max;
    }

    return value;
}

/**
 * Generate a random geolocation at some distance (in miles)
 * from a given location
 */
function varylocation(latitude, longitude, distance) {
    // Convert to meters, use Earth radius, convert to radians
    var radians = (distance * 1609.344 / 6378137) * (180 / Math.PI);

    latitude += radians,
    longitude += radians / Math.cos(latitude * Math.PI / 180)

    // Ensure valid latitude and longitude
    latitude = ensureRange(latitude, -90, 90);
    longitude = ensureRange(longitude, -180, 180);

    return {
        latitude: latitude,
        longitude: longitude
    };
}

/**
 * Entry point function called by the simulation engine.
 * Returns updated simulation state.
 * Device property updates must call updateProperties() to persist.
 *
 * @param context             The context contains current time, device model and id
 * @param previousState       The device state since the last iteration
 * @param previousProperties  The device properties since the last iteration
 */
/*jslint unparam: true*/
function main(context, previousState, previousProperties) {

    // Restore the global device properties and the global state before
    // generating the new telemetry, so that the telemetry can apply changes
    // using the previous function state.
    restoreSimulation(previousState, previousProperties);

    // temperature +/- 1%,  Min 35, Max 100
    state.temperature = vary(state.temperature, 1, 35, 100);

    // 150 +/- 5%,  Min 50, Max 300
    state.pressure = vary(150, 5, 50, 300);

    // 0.1 miles around some location
    if (state.moving) {
        var coords = varylocation(state.latitude, state.longitude, 0.1);
        state.latitude = coords.latitude;
        state.longitude = coords.longitude;
    }

    updateState(state);
}
