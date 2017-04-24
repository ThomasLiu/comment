"use strict"

import 'bootstrap'

import {form2obj} from '../util/form2obj'

export function initUi() {


    if ($('.js-cache').length > 0) {
        $('.js-cache').on('keyup', function(){
            var $this = $(this),
                key = $this.data('key')
            window.localStorage[key] = $this.val()
        })
        $('.js-cache').each(function(){
            var $this = $(this),
                key = $this.data('key');
            if (!$this.val()) {
                $this.val( window.localStorage[key])
            }  
        })
    }

    if ($('#editErrorModal').length > 0) {
        $('#editErrorModal').modal('show')
    }


    if ($('.js_del_btn').length > 0){
        $('.js_del_btn').on('click',function() {
            var $this = $(this),
                url = $this.data('url')
            
            if (!window.confirm("Confirm to delete?")) {
                return false
            }

            console.log(url)
            if (url) {
                $.ajax({
                    type: "DELETE",
                    url: url
                })
                .done( function (res) {
                    if (res.status.code == 0) {
                        // alert( "Data delete: success " + res.status.msg )
                        window.location.href= location.href
                    } else {
                        alert( "Data delete fail: " + res.status.msg )
                    }
                })
            }
            
        })
    }
    
    if ($('.js_edit_btn').length > 0){
        $('.js_edit_btn').on('click', function() {
            var $this = $(this),
                url = $this.data('url')
            
            console.log(url)
            if (url){
                if (!confirm("Confirm to submit?")) {
                    return window.event.returnValue = false
                }

                var form = document.querySelector('form')
                var data = form2obj(form)
                console.log(data)

                // return false
                $.ajax({
                        type: "PATCH",
                        url: url,
                        data : data
                    })
                    .done( function( res ) {
                        if (res.status.code == 0){
                            // alert( "Data delete: success " + res.status.msg )
                            window.location.href= res.data.redirect
                        } else {
                            alert( "Data submit fail: " + res.status.msg )
                        }
                    })

                return false
            } else {
                return true
            }
        })
    }

}

