define(['./vessel', './world', '../bower_components/async/dist/async.js', './pid-controller'], function (vessel, world, async, pidController) {
    function launch() {
        //setInterval(function(){
        //    async.parallel({
        //        orientation:vessel.attitude.orientation,
        //        velocityOrientation:vessel.attitude.velocityOrientation
        //    },function(err, results){
        //        //console.info(results.orientation);
        //        console.info(results.velocityOrientation);
        //    });
        //},4000);

        //vessel.attitude.flyByWire.on();
        //vessel.attitude.set(0, 0, 0);
        vessel.actionGroups.eight();
        //vessel.stage();
        setThrottle();
        //monitorGravityTurn();
    }

    function setThrottle() {
        var throttleControl = new pidController(0.01, 0.01, 0.01, 1); // k_p, k_i, k_d,
        ascentThrottleLoop(throttleControl);
    }

    function ascentThrottleLoop(throttleControl){
        vessel.custom.throttleInfo(function (err, results) {
            var targetVelocity = getAscentVelocity(results.apoapsis);
            if (targetVelocity !== throttleControl.getTarget()) {
                console.warn('new target, reseting');
                throttleControl.reset();
                throttleControl.setTarget(targetVelocity);
            }
            if(targetVelocity === 0){
                vessel.throttle.cut();
                //start the check for circularisation burn
                return;
            }
            var correction = throttleControl.update(results.velocity);
            console.info({
                correction: correction,
                target: targetVelocity,
                current: results.velocity
            });
            vessel.throttle.set(correction);
            return setTimeout(function(){
                ascentThrottleLoop(throttleControl);
            }, 1000);
        });
    }

    function getAscentVelocity(apoapsis) {
        if (apoapsis < 10000) {
            return Math.sqrt(apoapsis/0.2) +100;
        }
        if (apoapsis < 35000) {
            return Math.sqrt(apoapsis/0.054) -106.72;
        }
        if (apoapsis >= 80000) {
            return 0;
        }
        return 2400;
    }

    function getIdealAcceleration(altitude, velocity) {
        if (velocity < 100) {
            return 3;
        }
        if (altitude < 10000) {
            if (velocity > 300) {
                return 1;
            }
            return 1.8;
        }
        if (altitude < 20000) {
            if (velocity > 800) {
                return 1;
            }
            return 1.6;
        }
        if (altitude < 25000) {
            if (velocity > 1200) {
                return 1;
            }
            return 2;
        }
        return 8;

    }

    function monitorGravityTurn() {
        async.parallel({
            pitch: vessel.attitude.pitch.get,
            apoapsis: vessel.situation.apoapsis.height,
            angularVelocity: vessel.situation.velocity.angular
        }, function (error, results) {
            if (results.velocity < 100) {
                return setTimeout(monitorGravityTurn, 500);
            }
            var idealAscentAngle = getIdealAscentAngle(results.apoapsis);
            var yaw = getGravityManouver(results.pitch, idealAscentAngle, results.angularVelocity);
            vessel.attitude.yaw.set(yaw.magnitude);
            console.info('[' + yaw + '](' + results.pitch + '/' + idealAscentAngle + ')<' + results.angularVelocity + '>');
            setTimeout(monitorGravityTurn, yaw.duration);
        });
    }

    //gets the x,y,z degrees of the vessels orientation
    function getVesselOrientation(pitch, heading) {
        /*The api seems to use a different orientation for its vectors, the [] indicate positive:
         y: [N]-S
         X: up-[down]
         z: E-[W]
         * */
        return {
            x: pitch,
            y: Math.cos(heading),
            z: Math.sin(heading),
        }
    }

    //Take in the velocity vector and calculate the
    function getVelocityOrientation(x, y, z) {
        /*The api seems to use a different orientation for its vectors, the [] indicate positive:
         y: [N]-S
         X: up-[down]
         z: E-[W]
         *
         http://www.blitzmax.com/Community/posts.php?topic=65713
         https://www.google.co.za/search?hl=en&q=convert+vector+to+degrees&gws_rd=ssl#safe=off&hl=en&q=convert+3d+vector+to+degrees
         http://snipd.net/2d-and-3d-vector-normalization-and-angle-calculation-in-c
         */
    }

    function getGravityManouver(pitch, idealAscentAngle, angularVelocity) {
        console.info(angularVelocity);
        if (angularVelocity > 0.0165) {
            console.info("avoiding spin");
            return {
                magnitude: 0,
                duration: 750
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