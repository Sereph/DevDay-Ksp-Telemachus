define(['./vessel', './world', '../bower_components/async/dist/async.js', './pid-controller', 'jquery'], function (vessel, world, async, pidController, $) {
    var _gameLoopInterval;
    var _targetApoapsis = 100000;
    var _maximumApoapsis = 150000;
    var _minimumPeriapsis = 70000;
    var _fairingDeployAltitude = 50000;
    var _targetPeriapsis = _targetApoapsis;
    var _ascentPhaseOneComplete = false;
    var _fairingsDiscarded = false;
    var _watchingForCircularisation = false;
    var _startedCircularisationBurn = false;
    var _timeToApoapsisToBegingCircularisationBurn = 5;

    function launch() {
        //setInterval(function () {
        //    vessel.attitude.roll.get(function (err, result) {
        //        console.log(result);
        //    });
        //}, 1000);
        vessel.avionics.sas.on();
        vessel.attitude.flyByWire.on();
        vessel.attitude.set(0, 0, 0);
        vessel.throttle.full();
        vessel.stage();
        beginMonitoringLoop();
    }

    function stop() {
        vessel.attitude.flyByWire.off();
        vessel.attitude.mechJeb.off();
        clearInterval(_gameLoopInterval);
    }

    function abort() {
        stop();
        vessel.abort();
    }

    function deployFairingsIfAllowed(results) {
        if (_fairingsDiscarded === true) {
            return;
        }
        if (results.altitude > _fairingDeployAltitude) {
            _fairingsDiscarded = true;
            vessel.stage();
        }
        return;
    }

    function deploySolarPanels() {
        vessel.actionGroups.seven();
    }

    var circularisationStage = 1;

    function circularisationLoopUsingFirstStage(results) {
        if (results.timeToApoapsis > _timeToApoapsisToBegingCircularisationBurn && _startedCircularisationBurn === false) {
            return;
        }
        _startedCircularisationBurn = true;
        if (circularisationStage === -1) {
            return;
        }
        if (circularisationStage === 1) {
            if (results.periapsis < 10000) {
                vessel.throttle.full();
            } else {
                vessel.throttle.cut();
                circularisationStage = -1;
                setTimeout(function () {
                    vessel.stage();
                    deploySolarPanels();
                    setTimeout(function () {
                        circularisationStage = 2;
                        deploySolarPanels();
                    }, 1000);
                }, 1000);
            }
        } else {
            var belowTargetPeriapsis = results.periapsis < _targetPeriapsis;
            var aboveMinimumPeriapsis = results.periapsis > _minimumPeriapsis;
            var aboveMaximumApoapsis = results.apoapsis > _maximumApoapsis;
            if (belowTargetPeriapsis) {
                if (aboveMaximumApoapsis && aboveMinimumPeriapsis) {
                    return endCircularisationBurn()
                }
                vessel.throttle.full();
            } else {
                endCircularisationBurn()
            }
        }
    }

    function endCircularisationBurn() {
        vessel.throttle.cut();
        _watchingForCircularisation = false;
        setTimeout(function () {
            stop();
        }, 1000);
    }

    function beginMonitoringLoop() {
        var throttleControlPid = new pidController(0.01, 0.01, 0.01, 1); // k_p, k_i, k_d,
        var pitchControlPid = new pidController(0.0001, 0.01, 0.01, 1); // k_p, k_i, k_d,
        var headingControlPid = new pidController(0.0001, 0.001, 0.01, 1); // k_p, k_i, k_d,
        var rollControlPid = new pidController(0.00005, 0.000001, 0.01, 0.35); // k_p, k_i, k_d,
        _gameLoopInterval = setInterval(function () {
            vessel.custom.getAscentInformation(function (err, results) {
                if (!_ascentPhaseOneComplete) {
                    ascentThrottleLoop(throttleControlPid, results);
                    pitchLoop(pitchControlPid, results);
                }
                deployFairingsIfAllowed(results)
                headingLoop(headingControlPid, results);
                rollLoop(rollControlPid, results);
                if (_watchingForCircularisation === true) {
                    circularisationLoopUsingFirstStage(results);
                }
            });
        }, 350);
    }

    function headingLoop(headingControlPid, results) {
        if (results.pitch > 89) {
            return;
        }
        var targetHeading = 90;
        headingControlPid.setTarget(targetHeading);
        var correction = headingControlPid.update(results.heading);
        vessel.attitude.pitch.set(limitPitchRollYawManeuvers(correction));
    }

    function rollLoop(rollControlPid, results) {
        if (results.pitch > 89) {
            return;
        }
        var targetRoll = -90;
        rollControlPid.setTarget(targetRoll);
        var correction = rollControlPid.update(results.roll);
        correction = correction * -1;
        vessel.attitude.roll.set(limitPitchRollYawManeuvers(correction));
    }

    function ascentThrottleLoop(throttleControlPid, results) {
        var targetVelocity = getAscentVelocity(results.apoapsis, results.altitude);
        if (targetVelocity !== throttleControlPid.getTarget()) {
            throttleControlPid.reset();
            throttleControlPid.setTarget(targetVelocity);
        }
        if (targetVelocity === 0) {
            endAscentPhaseOne();
            return;
        }
        var correction = throttleControlPid.update(results.velocity);
        vessel.throttle.set(correction);
    }

    function endAscentPhaseOne() {
        console.info('Ascent Phase Complete, waiting to circularise');
        vessel.throttle.cut();
        _ascentPhaseOneComplete = true;
        vessel.attitude.flyByWire.off();
        vessel.attitude.mechJeb.holdPrograde();
        vessel.avionics.rcs.on();
        _watchingForCircularisation = true;
    }

    function getAscentVelocity(apoapsis, altitude) {
        if (apoapsis >= _targetApoapsis) {
            return 0;
        }
        //if (altitude < 12000) {
        //    return Math.sqrt(altitude / 0.4) + 100;
        //}
        //if (altitude < 34000) {
        //    return Math.sqrt(altitude / 0.009) - 881.5;
        //}
        //return 2400;
        if (altitude < 10000) {
            return (0.015 * altitude) + 130
        }
        if(altitude > 35000){
            return 2500;
        }
        return (Math.pow(altitude, 2) / 1100500) + 190;
    }

    var prograde = 'prograde';

    function pitchLoop(pitchControlPid, results) {
        if (results.apoapsis >= _targetApoapsis) {

            return;
        }
        var targetPitch = getIdealAscentAngle(results.altitude, results.apoapsis, results.pitch, results.velocityOrientationAngle);
        if (targetPitch === prograde) {
            targetPitch = results.pitch;
        }
        if (targetPitch !== pitchControlPid.getTarget()) {
            pitchControlPid.reset();
            pitchControlPid.setTarget(targetPitch);
        }
        var correction = pitchControlPid.update(results.pitch);
        correction = correction * -1;
        correction = limitPitchRollYawManeuvers(correction);
        vessel.attitude.yaw.set(correction);
    }

    function getIdealAscentAngle(altitude, apoapsis, pitch, velocityOrientationAngle) {
        if (altitude < 10000) {
            return Math.sqrt((500000000 - Math.pow(altitude, 2)) / 61500);
        }
        return getPitchBasedOnAngle(altitude, pitch, velocityOrientationAngle);
    }

    function getPitchBasedOnAngle(altitude, pitch, velocityOrientationAngle) {
        if (pitch <= 7) {
            console.info('at target');
            return prograde;
        }
        if (velocityOrientationAngle > 5) {
            console.info(velocityOrientationAngle);
            return prograde;
        }
        if (altitude < 20000) {
            return pitch - 2;
        }
        if (altitude < 30000) {
            return pitch - 3.5;
        }
        return pitch - 4.5;
    }

    function limitPitchRollYawManeuvers(correction) {
        var upperBound = 0.3;
        var lowerBound = -1 * upperBound;
        if (correction < lowerBound) {
            console.warn('lower bound enforced');
            correction = lowerBound;
        }
        else if (correction > upperBound) {
            console.warn('upper bound enforced');
            correction = upperBound;
        }
        return correction;
    }

    return {
        launch: launch,
        stop: stop,
        abort: abort
    };
});