define(['./vessel', './world', '../bower_components/async/dist/async.js'], function (vessel, world, async) {
    function launch() {
        //vessel.attitude.flyByWire.on();
        //vessel.throttle.full();
        //vessel.stage();
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
        var gravityTurnStep = setInterval(function () {
            async.parallel({
                altitude: vessel.situation.altitude,
                velocity: vessel.situation.velocity.surface.resultant
            }, function (error, results) {
                console.log('results : ' + JSON.stringify(results));
                clearInterval(gravityTurnStep);
            });
        }, 1000);
    }

    return {
        launch: launch
    };
});