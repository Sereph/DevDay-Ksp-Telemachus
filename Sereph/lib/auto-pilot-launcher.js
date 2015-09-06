define(['./vessel', './world', '../bower_components/async/dist/async.js', './pid-controller'], function (vessel, world, async, pidController) {
    var _gameLoopInterval;
    var _targetApoapsis = 85000;
    var ascentThrustComplete = false;

    function launch() {
        //setInterval(function(){
        //    vessel.situation.angleToPrograde(function(err,results){
        //        console.info(results);
        //    });
        //},1000);

        //vessel.actionGroups.eight();
        //monitorGravityTurn();

        vessel.throttle.full();
        vessel.attitude.flyByWire.on();
        vessel.attitude.set(0, 0, 0);
        vessel.avionics.sas.on();
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
        _gameLoopInterval = setInterval(function () {
            vessel.custom.getAscentInformation(function (err, results) {
                if (!ascentThrustComplete) {
                    ascentThrottleLoop(throttleControlPid, results);
                }
                pitchLoop(pitchControlPid, results);
            });
        }, 350);

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

        //if (apoapsis < 25022) {
        //    return Math.sqrt((900000000 - Math.pow(apoapsis, 2)) / 93332);
        //}
        //return Math.sqrt((1800000000 - Math.pow(apoapsis, 2)) / 400000);
    }


    //function monitorGravityTurn() {
    //    async.parallel({
    //        pitch: vessel.attitude.pitch.get,
    //        apoapsis: vessel.situation.apoapsis.height,
    //        angularVelocity: vessel.situation.velocity.angular
    //    }, function (error, results) {
    //        if (results.velocity < 100) {
    //            return setTimeout(monitorGravityTurn, 500);
    //        }
    //        var idealAscentAngle = getIdealAscentAngle(results.apoapsis);
    //        var yaw = getGravityManouver(results.pitch, idealAscentAngle, results.angularVelocity);
    //        vessel.attitude.yaw.set(yaw.magnitude);
    //        console.info('[' + yaw + '](' + results.pitch + '/' + idealAscentAngle + ')<' + results.angularVelocity + '>');
    //        setTimeout(monitorGravityTurn, yaw.duration);
    //    });
    //}

    //function getGravityManouver(pitch, idealAscentAngle, angularVelocity) {
    //    console.info(angularVelocity);
    //    if (angularVelocity > 0.0165) {
    //        console.info("avoiding spin");
    //        return {
    //            magnitude: 0,
    //            duration: 750
    //        };
    //    }
    //    var diff = Math.abs(pitch - idealAscentAngle);
    //    var magnitude = diff / 10;
    //    var maxMagnitude = 0.1;
    //    if (magnitude > maxMagnitude) {
    //        magnitude = maxMagnitude;
    //    }
    //    if (pitch < idealAscentAngle) {
    //        //we are pointing lower than ideal
    //        magnitude = (magnitude * -1);
    //    }
    //    return {
    //        magnitude: magnitude,
    //        duration: 100
    //    }
    //
    //}


    return {
        launch: launch,
        stop: stop,
        abort: abort
    };
});