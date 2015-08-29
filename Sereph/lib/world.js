define(['./api','../bower_components/moment/moment.js'], function (api, moment) {
    return {
        getUniversalTime:function(callback){
            api.command('t.universalTime',function(response){
                callback(jKSPWAPI.formatters.time(response));
            });
        },
        getMissionTime:function(callback){
            api.command('v.missionTime', function(response){
                callback(jKSPWAPI.formatters.time(response));
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
});