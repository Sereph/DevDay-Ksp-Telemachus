define(['./vessel', './world', '../bower_components/async/dist/async.js', './pid-controller', 'jquery'], function (vessel, world, async, pidController, $) {
    var _gameLoopInterval;
    var _targetApoapsis = 85000;
    var ascentThrustComplete = false;
    var ascentPitchYawThreshold = 0.02;
    var negativeAscentPitchYawThreshold = ascentPitchYawThreshold * -1;

    function launch() {
        vessel.avionics.sas.on();
        vessel.attitude.flyByWire.on();
        vessel.attitude.set(0, 0, 0);
        vessel.throttle.full();
        vessel.stage();
        beginMonitoringLoop();
    }

    function stop() {
        vessel.attitude.flyByWire.off();
        clearInterval(_gameLoopInterval);
    }

    function abort() {
        stop();
        vessel.abort();
    }

    function beginMonitoringLoop() {
        var throttleControlPid = new pidController(0.01, 0.01, 0.01, 1); // k_p, k_i, k_d,
        var pitchControlPid = new pidController(0.0001, 0.01, 0.01, 1); // k_p, k_i, k_d,
        var headingControlPid = new pidController(0.000001, 0.01, 0.01, 1); // k_p, k_i, k_d,
        _gameLoopInterval = setInterval(function () {
            vessel.custom.getAscentInformation(function (err, results) {
                if (!ascentThrustComplete) {
                    ascentThrottleLoop(throttleControlPid, results);
                }
                pitchLoop(pitchControlPid, results);
                headingLoop(headingControlPid, results);
            });
        }, 350);
    }

    function headingLoop(headingControlPid, results) {
        if (results.pitch > 89) {
            return;
        }
        var targetHeading = 0;
        headingControlPid.setTarget(targetHeading);
        var correction = headingControlPid.update(results.heading);
        if (correction > ascentPitchYawThreshold) {
            correction = ascentPitchYawThreshold;
        }
        if (correction < negativeAscentPitchYawThreshold) {
            correction = negativeAscentPitchYawThreshold;
        }
        if (results.heading < 90) {
            correction = correction * -1;
        }
        console.info({
            correction: correction,
            heading: results.heading
        });
        vessel.attitude.pitch.set(correction);
    }


    function ascentThrottleLoop(throttleControlPid, results) {
        var targetVelocity = getAscentVelocity(results.apoapsis, results.altitude);
        if (targetVelocity !== throttleControlPid.getTarget()) {
            throttleControlPid.reset();
            throttleControlPid.setTarget(targetVelocity);
        }
        if (targetVelocity === 0) {
            vessel.throttle.cut();
            ascentThrustComplete = true;
            //todo start the check for circularisation burn
            return;
        }
        var correction = throttleControlPid.update(results.velocity);
        vessel.throttle.set(correction);
    }

    function getAscentVelocity(apoapsis, altitude) {
        if (apoapsis >= _targetApoapsis) {
            return 0;
        }
        if (altitude < 12000) {
            return Math.sqrt(altitude / 0.4) + 100;
        }
        if (altitude < 35000) {
            return Math.sqrt(altitude / 0.009) - 881.5;
        }
        return 2400;
    }

    function pitchLoop(pitchControlPid, results) {
        var targetPitch = getIdealAscentAngle(results.altitude, results.apoapsis, results.pitch);
        if (targetPitch < 0) {
            targetPitch = results.pitch;
        }
        if (targetPitch !== pitchControlPid.getTarget()) {
            pitchControlPid.reset();
            pitchControlPid.setTarget(targetPitch);
        }
        var correction = pitchControlPid.update(results.pitch);
        correction = correction * -1;
        vessel.attitude.yaw.set(correction);
    }

    function getIdealAscentAngle(altitude, apoapsis, pitch) {
        if (altitude < 12000) {
            return Math.sqrt((500000000 - Math.pow(altitude, 2)) / 61500);
        }
        if (apoapsis < 35000 && pitch > 35) {
            return -1;
        }
        if (apoapsis < _targetApoapsis) {
            var ideal = apoapsis / 10000 / 1.3;
            var diff = ideal - pitch;
            var absDiff = Math.abs(diff);
            var threshold = 3;
            var result = ideal;
            if (diff > 0) {
                if (absDiff > threshold) {
                    result = pitch + threshold;
                }
                else {
                    result = pitch + absDiff;
                }
            } else {
                if (absDiff > threshold) {
                    result = pitch - threshold;
                }
                else {
                    result = pitch - absDiff;
                }
            }
            if (result < 5) {
                return 5;
            }
            return result;
        }
        return 0;
    }

    return {
        launch: launch,
        stop: stop,
        abort: abort
    };
});