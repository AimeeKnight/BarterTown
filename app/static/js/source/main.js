(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    $('#offers').on('click', '#offer-item', offer);
    $('#winning-item').click(trade);
  }

  function offer(){
    var url = window.location.origin + '/items/offer/' + $('#itemSelect').find(':selected').val() + '/' + $('#item-id').text();
    var type = 'POST';
    var success = console.log('bid made');
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

})();

