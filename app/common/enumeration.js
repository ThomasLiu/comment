/**
 * Created by user on 5/10/15.
 */

"use strict"
module.exports = {
    roleType: [
        {value: 0, title: 'admin'},
        {value: 1, title: 'manager'},
        {value: 2, title: 'client'},
        {value: 3, title: 'person'},
    ],
    tableNameTypeObj: {
        area : 'area',
        industry : 'industry',
        language : 'language',
        nationality : 'nationality',
        post : 'post',
        seniority : 'seniority'
    },
    interviewTypeObj: {
        willInterview : 1,
        interviewed : 2,
        offer : 3,
        fire : 4
    },
    interviewType: [
        {value: 1, title: 'will get further interviews'},
        {value: 2, title: 'is in consideration'},
        {value: 3, title: 'got an offer'},
        {value: 4, title: 'was denied'},
    ]
}
