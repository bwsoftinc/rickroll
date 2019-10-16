'use strict';

class flQueue {
  constructor(length, diff) {
    var a = new Array();
    var min = 100000;

    this.sample = function(val) {
      if(val === null)
        return null;

      if(a.length === length) {
        var lost = a[0];
        a.shift();
      
        if(min === lost)
          min = a.reduce((min, x) => x < min? x : min, a[0]);
      }
      else if (val < min)
        min = val;
     
      a.push(val);
      return val > (min + diff);
    };
  }
}

module.exports = flQueue;
