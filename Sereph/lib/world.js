define(['./api','../bower_components/moment/moment.js'], function (api, moment) {
    return {
        getUniversalTime:function(callback){
            api.command('t.universalTime',function(response){
                callback(formatTime(response));
            });
        },
        getMissionTime:function(callback){
            api.command('v.missionTime', function(response){
                callback(formatTime(response));
            });
        },
        pause:function(){
            api.command('t.pause');
        },
        unpause:function(){
            api.command('t.unpause');
        },
        timewarp: function (factor) {
            api.command('t.timeWarp['+factor+']');
        }
    }

    function formatTime(numericalDate){
        var timeDate = new Date(1970,0,1);
        timeDate.setSeconds(numericalDate);
        return moment(timeDate);
    }
});