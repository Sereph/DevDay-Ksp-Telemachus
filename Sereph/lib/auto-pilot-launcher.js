define(['./vessel', './world', '../bower_components/async/dist/async.js'], function (vessel, world, async) {
    function launch() {
        //limitThrottleToTerminalVelocity();

        vessel.attitude.flyByWire.on();
        vessel.attitude.set(0, 0, 0);
        vessel.throttle.full();
        vessel.stage();
        monitorGravityTurn();
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

    function monitorGravityTurn() {
        async.parallel({
            velocity: vessel.situation.velocity.surface.resultant,
            pitch: vessel.attitude.pitch.get,
            apoapsis: vessel.situation.apoapsis.height,
            angularVelocity: vessel.situation.velocity.angular
        }, function (error, results) {
            if (results.velocity < 100) {
                // not yet at 100 m/s
                return setTimeout(monitorGravityTurn, 500);
            }
            var idealAscentAngle = 10;// getIdealAscentAngle(results.apoapsis);
            var yaw = getGravityManouver(results.pitch, idealAscentAngle, results.angularVelocity);
            vessel.attitude.yaw.set(yaw.magnitude);
            console.info('[' + yaw + '](' + results.pitch + '/' + idealAscentAngle + ')<' + results.angularVelocity + '>');
            setTimeout(monitorGravityTurn, yaw.duration);
        });
    }

    function getGravityManouver(pitch, idealAscentAngle, angularVelocity) {
        //todo needs to return the mangnitude and duration not just magnitude
        if (angularVelocity > 0.020) {
            console.info("avoiding spin");
            return {
                magnitude: 0,
                duration: 500
            };
        }
        var diff = Math.abs(pitch - idealAscentAngle);
        var magnitude = diff / 10;
        var maxMagnitude = 0.1;
        if (magnitude > maxMagnitude) {
            magnitude = maxMagnitude;
        }
        if (pitch < idealAscentAngle) {
            //we are pointing lower than ideal
            magnitude = (magnitude * -1);
        }
        return {
            magnitude: magnitude,
            duration: 100
        }

    }

    function getIdealAscentAngle(apoapsis) {
        // start 90deg ~ arround 0 apoapsis, end 0 deg
        // don't increase pitch more than current pitch + x to prevent flips
        var idealAscentAngle;
        if (apoapsis < 1000) {
            idealAscentAngle = 89;
        } else if (apoapsis < 2000) {
            idealAscentAngle = 88;
        }
        else if (apoapsis < 3000) {
            idealAscentAngle = 87;
        }
        else if (apoapsis < 4000) {
            idealAscentAngle = 86;
        }
        else if (apoapsis < 5000) {
            idealAscentAngle = 85;
        }
        else if (apoapsis < 6000) {
            idealAscentAngle = 84;
        }
        else if (apoapsis < 7000) {
            idealAscentAngle = 83;
        }
        else if (apoapsis < 8000) {
            idealAscentAngle = 82;
        }
        else if (apoapsis < 9000) {
            idealAscentAngle = 81;
        }
        else if (apoapsis < 10000) {
            idealAscentAngle = 80;
        }
        else if (apoapsis < 12000) {
            idealAscentAngle = 75;
        }
        else if (apoapsis < 14000) {
            idealAscentAngle = 70;
        }
        else if (apoapsis < 16000) {
            idealAscentAngle = 65;
        }
        else if (apoapsis < 18000) {
            idealAscentAngle = 60;
        }
        else if (apoapsis < 20000) {
            idealAscentAngle = 55;
        }
        else if (apoapsis < 25000) {
            idealAscentAngle = 40;
        }
        else if (apoapsis < 30000) {
            idealAscentAngle = 35;
        }
        else if (apoapsis < 35000) {
            idealAscentAngle = 30;
        }
        else if (apoapsis < 40000) {
            idealAscentAngle = 25;
        }
        else if (apoapsis < 45000) {
            idealAscentAngle = 15;
        }
        else if (apoapsis < 50000) {
            idealAscentAngle = 10;
        }
        else {
            idealAscentAngle = 5;
        }
        return idealAscentAngle
    }

    return {
        launch: launch
    };
});