define(['./vessel', './world', '../bower_components/async/dist/async.js'], function (vessel, world, async) {
    function launch() {

        vessel.attitude.flyByWire.on();
        vessel.attitude.set(0, 0, 0);
        vessel.throttle.full();
        vessel.actionGroups.eight();
        vessel.stage();
        setThrottle();
        monitorGravityTurn();
    }

    function setThrottle() {
        async.parallel({
            velocity: vessel.situation.velocity.surface.resultant,
            atmosphericDensity: vessel.situation.atmosphericDensity,
            altitude : vessel.situation.altitude,
            acceleration: vessel.sensors.accelerometer
        }, function (error, results) {
            var idealAcceleration = getIdealAcceleration(results.altitude,results.velocity);
            var acceleration = results.acceleration[1][0];
            var diff = Math.abs(idealAcceleration- acceleration);
            console.info(JSON.stringify({a:acceleration,i:idealAcceleration, d:diff}));
            if(acceleration > idealAcceleration){
                vessel.throttle.down();
                return setTimeout(setThrottle, 500);
            }
            if(diff > 0.5){
                vessel.throttle.full();
                return setTimeout(setThrottle, 1000);
            }
            vessel.throttle.up();
            return setTimeout(setThrottle, 500);

        });
    }
    function getIdealAcceleration(altitude, velocity){
        if(velocity < 100)
        {
            return 3;
        }
        if(altitude < 10000){
            if(velocity > 300){
                return 1;
            }
            return 1.8;
        }
        if(altitude < 20000){
            if(velocity > 800){
                return 1;
            }
            return 1.6;
        }
        if(altitude < 25000){
            if(velocity > 1200){
                return 1;
            }
            return 2;
        }
        return 8;

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