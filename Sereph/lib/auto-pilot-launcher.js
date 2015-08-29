define(['./vessel'], function (vessel) {
    function launch(){
        vessel.attitude.flyByWire.on();
        vessel.attitude.yaw.set(0);
    }
    return {
        launch: launch
    };
});