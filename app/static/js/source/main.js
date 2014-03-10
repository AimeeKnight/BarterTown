(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    $('#offers').on('click', '#offer-item', offer);
    $('#winning-item').click(trade);
    $('#next').click(nextPage);
    $('#prev').click(prevPage);
    $('#limitButton').click(limitItems);
  }

  function offer(){
    var url = window.location.origin + '/items/offer/' + $('#itemSelect').find(':selected').val() + '/' + $('#item-id').text();
    var type = 'POST';
    var success = $('#alert-box').toggleClass('hide');
    $.ajax({url:url, type:type, success:success});
  }

  function trade(){
    var winnerId = $('#selectWinner').find(':selected').val();
    var originalId = $('#item-id').text();

    var url = window.location.origin + '/items/trade/' + originalId + '/' + winnerId;
    console.log(url);
    var type = 'POST';
    var success = console.log('trade made');
    $.ajax({url:url, type:type, success:success});
  }

  function nextPage(){
    var url = window.location.origin;
    var obj = {move: 'next'};
    var type = 'GET';
    $.ajax({url: url, data: obj, type: type});
  }

  function prevPage(){
    var url = window.location.origin;
    var obj = {move: 'prev'};
    var type = 'GET';
    $.ajax({url: url, data: obj, type: type});
  }

  function limitItems(){
    var limit = $('#limit').val();
    var url = window.location.origin + '?limit='+limit;
    var type = 'GET';
    $.ajax({url: url, type: type});
  }
})();

