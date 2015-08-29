define(['./vessel', './world', '../bower_components/async/dist/async.js'], function (vessel, world, async) {
    function launch() {
        vessel.attitude.flyByWire.on();
        vessel.attitude.set(90,0,0);
        vessel.throttle.full();
        vessel.stage();
        //limitThrottleToTerminalVelocity();
        executeGravityTurn();
    }

    function limitThrottleToTerminalVelocity() {
        var velocityCheck = setInterval(function () {
            vessel.situation.atmosphericDensity(function (value) {
                console.log('Atmospheric density : ' + value);
            });
            vessel.situation.altitude(function (value) {
                console.log('altitude : ' + value);
            });
        }, 1000);
    }

    function executeGravityTurn() {
        async.parallel({
            altitude: vessel.situation.altitude,
            velocity: vessel.situation.velocity.surface.resultant,
            pitch: vessel.attitude.pitch.get
        }, function (error, results) {
            console.log('results : ' + JSON.stringify(results));
            if (results.velocity < 100) {
                // not yet at 100 m/s
                return setTimeout(executeGravityTurn, 500);
            }
            var newPitch = getBestPitchForAltitude(results.altitude, results.pitch);
            console.log('New Pitch :' + newPitch);
            vessel.attitude.pitch.set(newPitch);
            setTimeout(executeGravityTurn, 500);
        });
    }

    function getBestPitchForAltitude(altitude, pitch) {
        // start 90deg ~ arround 0 altitude, end 0 deg
        // don't increase pitch more than current pitch + x to prevent flips
        var idealPitch;
        if (altitude < 1000) {
            idealPitch = 89;
        } else if (altitude < 2000) {
            idealPitch = 88;
        }
        else if (altitude < 3000) {
            idealPitch = 87;
        }
        else if (altitude < 4000) {
            idealPitch = 86;
        }
        else if (altitude < 5000) {
            idealPitch = 85;
        }
        else if (altitude < 6000) {
            idealPitch = 84;
        }
        else if (altitude < 7000) {
            idealPitch = 83;
        }
        else if (altitude < 8000) {
            idealPitch = 82;
        }
        else if (altitude < 9000) {
            idealPitch = 81;
        }
        else if (altitude < 10000) {
            idealPitch = 80;
        }
        var safetyNumber = 3;
        if (pitch - idealPitch > safetyNumber) {
            return pitch-safetyNumber;
        }
    }

    return {
        launch: launch
    };
});