/*
!TODO LIST!

  MISCELLANEOUS
#################
5 2    EFFICIENCY REFACTOR!
3 4    Create factory workers --DONE
1 4    Configure workers for alloy production --DONE
3 3    Metal farming
4 5    Metal room
4 2    Power farming
2 5    Creep queue for energy
2 2    Energy distribution to labs --DONE

2 3    Execute job post function every tick

  ROOM CONSTRUCTION
#####################
2 4    Roads
5 1    Room scout and discovery
5 5    Completely automated setup

*/
module.exports = {
  getSign: function (room) {
    if (room.controller.level <= 3) {
      return "Hi!"
    }
    else if (room.controller.level < 6) {
      return "Work is in progress in room " + room.name + "."
    }
    else if (room.controller.level < 8) {
      return "Work is still in progress in room " + room.name + "."
    }
    else {
      return "I'm back"
    }
  }
};