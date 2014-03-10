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
    $('#tagButton').click(searchByTag);
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
    var success = function(){window.location.href='/users/' + originalId;};
    $.ajax({url:url, type:type, success:success});
  }

  //----------PAGING----------//


  function nextPage(){
    var limitVal = $('#limit').val();
    window.location.href = ('/items?limit='+limitVal+'&move=next');
  }

  function prevPage(){
    var limitVal = $('#limit').val();
    window.location.href = ('/items?limit='+limitVal+'&move=prev');
  }

  function limitItems(){
    var limitVal = $('#limit').val();
    window.location.href = ('/items?limit='+limitVal);
  }

  //----------FILTER BY TAG--------//

  function searchByTag(){
    var tag = $('#selectTag').val();
    window.location.href = ('/items/filter?tags='+ tag);
  }

})();

