define(['./vessel', './world', '../bower_components/async/dist/async.js', './pid-controller'], function (vessel, world, async, pidController) {
    var _gameLoopInterval;

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
                ascentThrottleLoop(throttleControlPid, results);
                pitchLoop(pitchControlPid, results);
            });
        }, 500);

    }

    function ascentThrottleLoop(throttleControlPid, results) {
        var targetVelocity = getAscentVelocity(results.altitude,results.apoapsis);
        if (targetVelocity !== throttleControlPid.getTarget()) {
            throttleControlPid.reset();
            throttleControlPid.setTarget(targetVelocity);
        }
        if (targetVelocity === 0) {
            vessel.throttle.cut();
            //todo start the check for circularisation burn
            return;
        }
        var correction = throttleControlPid.update(results.velocity);
        vessel.throttle.set(correction);
    }

    function getAscentVelocity(apoapsis) {
        if (apoapsis >= 80000) {
            return 0;
        }
        if (apoapsis < 12000) {
            return Math.sqrt(apoapsis / 0.4) + 100;
        }
        if (apoapsis < 35000) {
            return Math.sqrt(apoapsis / 0.009) - 881.5;
        }
        return 2400;
    }

    function pitchLoop(pitchControlPid, results) {
        var targetPitch = getIdealAscentAngle(results.altitude);
        if (targetPitch !== pitchControlPid.getTarget()) {
            pitchControlPid.reset();
            pitchControlPid.setTarget(targetPitch);
        }
        var correction = pitchControlPid.update(results.pitch);
        console.info({
            pitch: results.pitch,
            target: targetPitch,
            correction: correction
        });
        vessel.attitude.yaw.set(correction);
    }

    function getIdealAscentAngle(apoapsis) {
        if (apoapsis < 1000) {
            return Math.sqrt((400000000 - Math.pow(apoapsis, 2)) / 49380);
        }
        if (apoapsis < 22804) {
            return Math.sqrt((700000000 - Math.pow(apoapsis, 2)) / 100000);
        }
        return Math.sqrt((1600000000 - Math.pow(apoapsis, 2)) / 600000);
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

    //function getIdealAscentAngle(apoapsis) {
    //    //// start 90deg ~ arround 0 apoapsis, end 0 deg
    //    //// don't increase pitch more than current pitch + x to prevent flips
    //    //var idealAscentAngle;
    //    //if (apoapsis < 1000) {
    //    //    idealAscentAngle = 89;
    //    //} else if (apoapsis < 2000) {
    //    //    idealAscentAngle = 88;
    //    //}
    //    //else if (apoapsis < 3000) {
    //    //    idealAscentAngle = 87;
    //    //}
    //    //else if (apoapsis < 4000) {
    //    //    idealAscentAngle = 86;
    //    //}
    //    //else if (apoapsis < 5000) {
    //    //    idealAscentAngle = 85;
    //    //}
    //    //else if (apoapsis < 6000) {
    //    //    idealAscentAngle = 84;
    //    //}
    //    //else if (apoapsis < 7000) {
    //    //    idealAscentAngle = 83;
    //    //}
    //    //else if (apoapsis < 8000) {
    //    //    idealAscentAngle = 82;
    //    //}
    //    //else if (apoapsis < 9000) {
    //    //    idealAscentAngle = 81;
    //    //}
    //    //else if (apoapsis < 10000) {
    //    //    idealAscentAngle = 80;
    //    //}
    //    //else if (apoapsis < 12000) {
    //    //    idealAscentAngle = 75;
    //    //}
    //    //else if (apoapsis < 14000) {
    //    //    idealAscentAngle = 70;
    //    //}
    //    //else if (apoapsis < 16000) {
    //    //    idealAscentAngle = 65;
    //    //}
    //    //else if (apoapsis < 18000) {
    //    //    idealAscentAngle = 60;
    //    //}
    //    //else if (apoapsis < 20000) {
    //    //    idealAscentAngle = 55;
    //    //}
    //    //else if (apoapsis < 25000) {
    //    //    idealAscentAngle = 40;
    //    //}
    //    //else if (apoapsis < 30000) {
    //    //    idealAscentAngle = 35;
    //    //}
    //    //else if (apoapsis < 35000) {
    //    //    idealAscentAngle = 30;
    //    //}
    //    //else if (apoapsis < 40000) {
    //    //    idealAscentAngle = 25;
    //    //}
    //    //else if (apoapsis < 45000) {
    //    //    idealAscentAngle = 15;
    //    //}
    //    //else if (apoapsis < 50000) {
    //    //    idealAscentAngle = 10;
    //    //}
    //    //else {
    //    //    idealAscentAngle = 5;
    //    //}
    //    //return idealAscentAngle
    //}
});