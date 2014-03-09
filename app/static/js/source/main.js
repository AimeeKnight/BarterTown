(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    $('#trade').click(trade);
  }

  function trade(){
    //var url = window.location.origin;
    var item1 = $('#itemSelect').text();
    console.log('balls');
    console.log(item1);
  }
})();

