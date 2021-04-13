// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
const request = require('request'); 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {
  dialogflow,
  BasicCard,
  BrowseCarousel,
  BrowseCarouselItem,
  Button,
  Carousel,
  Image,
  LinkOutSuggestion,
  List,
  MediaObject,
  Suggestions,
  SimpleResponse,
 } = require('actions-on-google');

// app const
const API_KEY = 'nwb234pvnq';
const API_FAILED_ERROR_MSG= 'Opps ! I stuck in traffic . Can you try again ?'
const PNR_STATUS_INTENT = 'pnr_status';
const TRAIN_SCHEDULE_INTENT = 'train_schedule';
const TRAIN_LIVE_RUNNING_STATUS_INTENT = 'train_live_running_status';
const intentSuggestions = [
  'PNR status',
  'Train Schedule',
  'Train Live Running Status'
];
const tryAgainSuggestion = ['Try again'];

//

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const app = dialogflow();


app.middleware((conv) => {
  conv.hasScreen =
    conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
  conv.hasAudioPlayback =
    conv.surface.capabilities.has('actions.capability.AUDIO_OUTPUT');
});
// Welcome
app.intent('Default Welcome Intent', (conv) => {
  conv.ask(new SimpleResponse({
    speech: 'Hi there!',
    text: 'Hi there!',
  }));
  conv.ask(new SimpleResponse({
    speech: 'I am BB, your Railway Assistant, I can help you finding PNR status, Train Schedule and Train Running Status. What would you like yo do ?',
    text: 'I am BB, your Railway Assistant, I can help you finding PNR status, Train Schedule and Train Running Status. What would you like yo do ?',
  }));
  conv.ask(new Suggestions(intentSuggestions));
});


 // PNR status Intent
app.intent(PNR_STATUS_INTENT,(conv)=>{
    let pnr = conv.parameters['number'];
    if(pnr.length<10){
        // conv.contexts.set({ name: PNR_STATUS_INTENT, lifespan: 2, parameters: { number: pnr }});
        conv.ask('It look like this is not a valid PNR number. Please enter a valid 10 digit PNR number.');
        conv.ask(new Suggestions(intentSuggestions));
        return;
    }
    // Do something with API and this number
    let result  = getPNRStatus(pnr);
    if(result.status){
        conv.ask('Here is your PNR status.');
        conv.ask(new List(result.data));
        conv.ask(new Suggestions(intentSuggestions));
    }else{
        conv.ask(result.data);
        conv.ask(new Suggestions(intentSuggestions));
    }
});

// Train Schedule Intent
app.intent(TRAIN_SCHEDULE_INTENT,(conv)=>{
    let trainNo = conv.parameters['number'];
    // Do something with API and this number
    getStationList(trainNo,function(result){
        if(result.status){
            conv.ask('Here is the train Schedule.');
            conv.ask(new List(result.data));
            conv.ask(new Suggestions(intentSuggestions));
        }else{
            conv.ask(result.data);
            conv.ask(new Suggestions(intentSuggestions));
        }  
    });
    
});
// Live Status
app.intent(TRAIN_LIVE_RUNNING_STATUS_INTENT,(conv)=>{
    let trainNo = conv.parameters['number'];
    // Do something with API and this number
    let result  = getLiveStatus(trainNo);
    if(result.status){
        let r = '';
        for(let i = 0 ;i<result.data.length;i++){
            r+=result.data[i];
        }
        conv.ask(r);
        conv.ask(new Suggestions(intentSuggestions));
    }else{
        conv.ask(result.data);
        conv.ask(new Suggestions(intentSuggestions));
    }
});
function getLiveStatus(){
    let response = {
    "position": "Train departed from MALWAN(MWH) and late by 37 minutes.",
    "train": {
        "classes": [
            {
                "available": "N",
                "name": "AC CHAIR CAR",
                "code": "CC"
            },
            {
                "available": "Y",
                "name": "SLEEPER CLASS",
                "code": "SL"
            },
            {
                "available": "Y",
                "name": "THIRD AC",
                "code": "3A"
            },
            {
                "available": "N",
                "name": "SECOND SEATING",
                "code": "2S"
            },
            {
                "available": "N",
                "name": "FIRST CLASS",
                "code": "FC"
            },
            {
                "available": "N",
                "name": "3rd AC ECONOMY",
                "code": "3E"
            },
            {
                "available": "N",
                "name": "FIRST AC",
                "code": "1A"
            },
            {
                "available": "Y",
                "name": "SECOND AC",
                "code": "2A"
            }
        ],
        "name": "NDLS-PURI PURSHOTTAM",
        "days": [
            {
                "runs": "Y",
                "code": "MON"
            },
            {
                "runs": "Y",
                "code": "TUE"
            },
            {
                "runs": "Y",
                "code": "WED"
            },
            {
                "runs": "Y",
                "code": "THU"
            },
            {
                "runs": "Y",
                "code": "FRI"
            },
            {
                "runs": "Y",
                "code": "SAT"
            },
            {
                "runs": "Y",
                "code": "SUN"
            }
        ],
        "number": "12802"
    },
    "response_code": 200,
    "debit": 2,
    "route": [
        {
            "scharr": "Source",
            "scharr_date": "15 Nov 2018",
            "actarr": "00:00",
            "distance": 0,
            "has_arrived": true,
            "has_departed": true,
            "latemin": 0,
            "status": "0 mins late",
            "day": 0,
            "station": {
                "lat": 28.6141793,
                "name": "NEW DELHI",
                "code": "NDLS",
                "lng": 77.2022662
            },
            "schdep": "22:25",
            "actarr_date": "15 Nov 2018",
            "actdep": "22:25"
        },
        {
            "scharr": "03:55",
            "scharr_date": "16 Nov 2018",
            "actarr": "04:30",
            "distance": 447,
            "has_arrived": true,
            "has_departed": true,
            "latemin": 35,
            "status": "35 mins late",
            "day": 1,
            "station": {
                "lat": 26.4547354,
                "name": "KANPUR CENTRAL",
                "code": "CNB",
                "lng": 80.3506961
            },
            "schdep": "04:00",
            "actarr_date": "16 Nov 2018",
            "actdep": "04:37"
        },
        {
            "scharr": "05:10",
            "scharr_date": "16 Nov 2018",
            "actarr": "05:51",
            "distance": 525,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 41,
            "status": "41 mins late",
            "day": 1,
            "station": {
                "lat": 25.75,
                "name": "FATEHPUR",
                "code": "FTP",
                "lng": 80.75
            },
            "schdep": "05:12",
            "actarr_date": "16 Nov 2018",
            "actdep": "05:52"
        },
        {
            "scharr": "07:05",
            "scharr_date": "16 Nov 2018",
            "actarr": "07:05",
            "distance": 642,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 25.4381302,
                "name": "ALLAHABAD JN",
                "code": "ALD",
                "lng": 81.8338005
            },
            "schdep": "07:15",
            "actarr_date": "16 Nov 2018",
            "actdep": "07:15"
        },
        {
            "scharr": "08:15",
            "scharr_date": "16 Nov 2018",
            "actarr": "08:15",
            "distance": 727,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 25.1461346,
                "name": "MIRZAPUR",
                "code": "MZP",
                "lng": 82.5689952
            },
            "schdep": "08:17",
            "actarr_date": "16 Nov 2018",
            "actdep": "08:17"
        },
        {
            "scharr": "08:45",
            "scharr_date": "16 Nov 2018",
            "actarr": "08:45",
            "distance": 758,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 25.1281931,
                "name": "CHUNAR",
                "code": "CAR",
                "lng": 82.8835399
            },
            "schdep": "08:47",
            "actarr_date": "16 Nov 2018",
            "actdep": "08:47"
        },
        {
            "scharr": "10:20",
            "scharr_date": "16 Nov 2018",
            "actarr": "10:20",
            "distance": 791,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 28.62788925,
                "name": "PT.DEEN DAYAL UPADHYAYA JN.",
                "code": "DDU",
                "lng": 77.1122717940814
            },
            "schdep": "10:35",
            "actarr_date": "16 Nov 2018",
            "actdep": "10:35"
        },
        {
            "scharr": "11:11",
            "scharr_date": "16 Nov 2018",
            "actarr": "11:11",
            "distance": 844,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 25.0415131,
                "name": "BHABUA ROAD",
                "code": "BBU",
                "lng": 83.6086173
            },
            "schdep": "11:12",
            "actarr_date": "16 Nov 2018",
            "actdep": "11:12"
        },
        {
            "scharr": "11:44",
            "scharr_date": "16 Nov 2018",
            "actarr": "11:44",
            "distance": 892,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 24.9509656,
                "name": "SASARAM",
                "code": "SSM",
                "lng": 84.0148733
            },
            "schdep": "11:45",
            "actarr_date": "16 Nov 2018",
            "actdep": "11:45"
        },
        {
            "scharr": "12:02",
            "scharr_date": "16 Nov 2018",
            "actarr": "12:02",
            "distance": 909,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 24.90776,
                "name": "DEHRI ON SONE",
                "code": "DOS",
                "lng": 84.1901412
            },
            "schdep": "12:04",
            "actarr_date": "16 Nov 2018",
            "actdep": "12:04"
        },
        {
            "scharr": "12:17",
            "scharr_date": "16 Nov 2018",
            "actarr": "12:17",
            "distance": 926,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 13.0197618,
                "name": "ANUGRAHA N ROAD",
                "code": "AUBR",
                "lng": 80.2207713229754
            },
            "schdep": "12:18",
            "actarr_date": "16 Nov 2018",
            "actdep": "12:18"
        },
        {
            "scharr": "13:10",
            "scharr_date": "16 Nov 2018",
            "actarr": "13:10",
            "distance": 995,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 24.7964355,
                "name": "GAYA JN",
                "code": "GAYA",
                "lng": 85.0079563
            },
            "schdep": "13:15",
            "actarr_date": "16 Nov 2018",
            "actdep": "13:15"
        },
        {
            "scharr": "13:59",
            "scharr_date": "16 Nov 2018",
            "actarr": "13:59",
            "distance": 1027,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 32.1044327,
                "name": "PAHARPUR",
                "code": "PRP",
                "lng": 70.9706664
            },
            "schdep": "14:01",
            "actarr_date": "16 Nov 2018",
            "actdep": "14:01"
        },
        {
            "scharr": "14:36",
            "scharr_date": "16 Nov 2018",
            "actarr": "14:36",
            "distance": 1071,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 24.385588,
                "name": "KODERMA",
                "code": "KQR",
                "lng": 85.562498606583
            },
            "schdep": "14:38",
            "actarr_date": "16 Nov 2018",
            "actdep": "14:38"
        },
        {
            "scharr": "15:26",
            "scharr_date": "16 Nov 2018",
            "actarr": "15:26",
            "distance": 1119,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 23.8903906,
                "name": "HAZARIBAGH RD",
                "code": "HZD",
                "lng": 85.3150201657408
            },
            "schdep": "15:28",
            "actarr_date": "16 Nov 2018",
            "actdep": "15:28"
        },
        {
            "scharr": "15:51",
            "scharr_date": "16 Nov 2018",
            "actarr": "15:51",
            "distance": 1146,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 23.987738,
                "name": "PARASNATH",
                "code": "PNME",
                "lng": 86.0377584
            },
            "schdep": "15:54",
            "actarr_date": "16 Nov 2018",
            "actdep": "15:54"
        },
        {
            "scharr": "16:10",
            "scharr_date": "16 Nov 2018",
            "actarr": "16:10",
            "distance": 1164,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 23.8717293,
                "name": "NSC BOSE J GOMO",
                "code": "GMO",
                "lng": 86.1524866
            },
            "schdep": "16:20",
            "actarr_date": "16 Nov 2018",
            "actdep": "16:20"
        },
        {
            "scharr": "16:40",
            "scharr_date": "16 Nov 2018",
            "actarr": "16:40",
            "distance": 1181,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 13.1263757,
                "name": "CHANDRAPURA",
                "code": "CRP",
                "lng": 76.5849262
            },
            "schdep": "16:42",
            "actarr_date": "16 Nov 2018",
            "actdep": "16:42"
        },
        {
            "scharr": "17:15",
            "scharr_date": "16 Nov 2018",
            "actarr": "17:15",
            "distance": 1196,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 23.6692956,
                "name": "BOKARO STL CITY",
                "code": "BKSC",
                "lng": 86.15111200000001
            },
            "schdep": "17:20",
            "actarr_date": "16 Nov 2018",
            "actdep": "17:20"
        },
        {
            "scharr": "18:23",
            "scharr_date": "16 Nov 2018",
            "actarr": "18:23",
            "distance": 1257,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 23.3698742,
                "name": "PURULIA JN",
                "code": "PRR",
                "lng": 86.3349104
            },
            "schdep": "18:25",
            "actarr_date": "16 Nov 2018",
            "actdep": "18:25"
        },
        {
            "scharr": "19:12",
            "scharr_date": "16 Nov 2018",
            "actarr": "19:12",
            "distance": 1311,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 22.955963,
                "name": "CHANDIL JN",
                "code": "CNI",
                "lng": 86.0546313
            },
            "schdep": "19:14",
            "actarr_date": "16 Nov 2018",
            "actdep": "19:14"
        },
        {
            "scharr": "20:04",
            "scharr_date": "16 Nov 2018",
            "actarr": "20:04",
            "distance": 1347,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 22.8015194,
                "name": "TATANAGAR JN",
                "code": "TATA",
                "lng": 86.2029579
            },
            "schdep": "20:19",
            "actarr_date": "16 Nov 2018",
            "actdep": "20:19"
        },
        {
            "scharr": "20:51",
            "scharr_date": "16 Nov 2018",
            "actarr": "20:51",
            "distance": 1384,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 22.6501286,
                "name": "GHATSILA",
                "code": "GTS",
                "lng": 86.4138841
            },
            "schdep": "20:52",
            "actarr_date": "16 Nov 2018",
            "actdep": "20:52"
        },
        {
            "scharr": "22:37",
            "scharr_date": "16 Nov 2018",
            "actarr": "22:37",
            "distance": 1482,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 1,
            "station": {
                "lat": 22.3199194,
                "name": "HIJILLI",
                "code": "HIJ",
                "lng": 87.3191844
            },
            "schdep": "22:47",
            "actarr_date": "16 Nov 2018",
            "actdep": "22:47"
        },
        {
            "scharr": "00:07",
            "scharr_date": "17 Nov 2018",
            "actarr": "00:07",
            "distance": 1594,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 2,
            "station": {
                "lat": 21.5017098,
                "name": "BALASORE",
                "code": "BLS",
                "lng": 86.9216712
            },
            "schdep": "00:12",
            "actarr_date": "17 Nov 2018",
            "actdep": "00:12"
        },
        {
            "scharr": "01:18",
            "scharr_date": "17 Nov 2018",
            "actarr": "01:18",
            "distance": 1656,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 2,
            "station": {
                "lat": 21.0582737,
                "name": "BHADRAKH",
                "code": "BHC",
                "lng": 86.4958396
            },
            "schdep": "01:20",
            "actarr_date": "17 Nov 2018",
            "actdep": "01:20"
        },
        {
            "scharr": "01:56",
            "scharr_date": "17 Nov 2018",
            "actarr": "01:56",
            "distance": 1698,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 2,
            "station": {
                "lat": 20.9433485,
                "name": "JAJPUR K ROAD",
                "code": "JJKR",
                "lng": 86.13271990000001
            },
            "schdep": "01:58",
            "actarr_date": "17 Nov 2018",
            "actdep": "01:58"
        },
        {
            "scharr": "03:00",
            "scharr_date": "17 Nov 2018",
            "actarr": "03:00",
            "distance": 1767,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 2,
            "station": {
                "lat": 20.4686,
                "name": "CUTTACK",
                "code": "CTC",
                "lng": 85.8792
            },
            "schdep": "03:05",
            "actarr_date": "17 Nov 2018",
            "actdep": "03:05"
        },
        {
            "scharr": "03:45",
            "scharr_date": "17 Nov 2018",
            "actarr": "03:45",
            "distance": 1794,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 2,
            "station": {
                "lat": 20.2665668,
                "name": "BHUBANESWAR",
                "code": "BBS",
                "lng": 85.8437586
            },
            "schdep": "03:50",
            "actarr_date": "17 Nov 2018",
            "actdep": "03:50"
        },
        {
            "scharr": "04:20",
            "scharr_date": "17 Nov 2018",
            "actarr": "04:20",
            "distance": 1813,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 2,
            "station": {
                "lat": 57.7144926,
                "name": "KHURDA ROAD JN",
                "code": "KUR",
                "lng": 26.8379726
            },
            "schdep": "04:25",
            "actarr_date": "17 Nov 2018",
            "actdep": "04:25"
        },
        {
            "scharr": "05:30",
            "scharr_date": "17 Nov 2018",
            "actarr": "05:30",
            "distance": 1856,
            "has_arrived": false,
            "has_departed": false,
            "latemin": 0,
            "status": "0 mins late",
            "day": 2,
            "station": {
                "lat": 19.8076083,
                "name": "PURI",
                "code": "PURI",
                "lng": 85.8252538
            },
            "schdep": "Destination",
            "actarr_date": "17 Nov 2018",
            "actdep": "00:00"
        }
    ],
    "current_station": {
        "lat": 35.3324228,
        "name": "MALWAN",
        "code": "MWH",
        "lng": 45.7519039
    },
    "start_date": "15 Nov 2018"
};
    if(response.response_code !== 200){
        
        return {status:false, data: ['Train Details not found. Tell me a valid train number.']}
    }else{
        let msg = [response.position.toLowerCase()]
        if(response.position.indexOf('Source')>=0 || response.position.indexOf('Destination')>=0){}
        else{
            for(let i=0;i<response.route.length;i++){
                let p = response.route[i];
                if(!p.has_arrived){
                    msg.push('The next stop will be '+p.station.name.toLowerCase()+ '.');
                    msg.push('The expected arrival time will be ' + p.actarr + ' ' + p.actarr_date);
                    break;
                }
            }
        }
        return {status:true, data:msg};
    }
}
function getStationList(n,callback){
    let stationAPIURL = 'https://api.railwayapi.com/v2/route/train/'+n+'/apikey/'+API_KEY;
    request(stationAPIURL, { json: true }, function(err, res, body) {
      if (err) { 
          callback({status:false, data: API_FAILED_ERROR_MSG})
      }else{
          response = body;
          if(response.response_code !== 200){
            callback({status:false, data: 'Train Details not found. Tell me a valid train number.'})
          }else{
                let obj = {};
                let day = '';
                for(let i = 0 ; i<response.train.days.length ; i++){
                    if(response.train.days[i]['runs'] === 'Y'){
                        day+=response.train.days[i]['code']+ ",";
                    }
                }
                let classes = '';
                for(let i = 0 ; i<response.train.classes.length ; i++){
                    if(response.train.classes[i]['available'] === 'Y'){
                        classes+=response.train.classes[i]['code']+ ",";
                    }
                }
                
                obj['train_details'] = {
                    title: 'Days: '+day.slice(0, -1),
                    description: 'Class: '+classes.slice(0, -1)
                };
                
                for(let i = 0 ; i<response.route.length ; i++){
                    let each = {
                    title: response.route[i]['station']['name']+'('+response.route[i]['station']['code']+')',
                    description: 'Arrival Time: '+response.route[i].scharr+'\nDeparture Time: '+ response.route[i].schdep
                  };
                  obj['sno'+i]=each;
                }
                let res = {
                    title: response.train.name+ '('+ response.train.number+')',
                    items: obj
                };
                callback({status:true, data:res});
            }
      }
    });
    
}
function getPNRStatus(n){
    // http call
    let response = {
      "response_code": 200,
      "debit": 3,
      "pnr": "1234567890",
      "doj": "25-6-2017",
      "total_passengers": 3,
      "chart_prepared": true,
      "from_station": {
        "name": "Kopargaon",
        "code": "KPG"
      },
      "to_station": {
        "name": "Hazrat Nizamuddin",
        "code": "NZM"
      },
      "boarding_point": {
        "name": "Kopargaon",
        "code": "KPG"
      },
      "reservation_upto": {
        "name": "Hazrat Nizamuddin",
        "code": "NZM"
      },
      "train": {
        "name": "GOA EXPRESS",
        "number": "12779"
      },
      "journey_class": {
        "name": "SLEEPER CLASS",
        "code": "SL"
      },
      "passengers": [
        {
          "no": 1,
          "current_status": "RLWL/11",
          "booking_status": "RLWL/39/GN"
        },
        {
          "no": 2,
          "current_status": "RLWL/12",
          "booking_status": "RLWL/40/GN"
        },
        {
          "no": 3,
          "current_status": "RLWL/13",
          "booking_status": "RLWL/41/GN"
        }
      ]
    };
    // return the card
    if(response.response_code === 200){
        let obj = {};
        for(let i = 0 ; i<response.passengers.length ; i++){
            let each = {
            title: 'Passenger '+(i+1),
            description: 'Current Status: '+response.passengers[i].current_status+'\nBooking Status: '+ response.passengers[i].booking_status
          };
          obj['sno'+i]=each;
        }
        let c = response.chart_prepared ? 'Chart Prepared' : 'Chart Not Prepared'
        let res = {
            title: response.train.name+ '('+ response.train.number+') DOJ: '+response.doj + ' '+c,
            items: obj
        };
      return {status:true,data:res};
    }else{
        return {status:false,data:'PNR not found or it has been expired.'};
    }
}
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);