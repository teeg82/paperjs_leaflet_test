define([], function(){
  function createPopupDiv() {
    return $('<div class="cfps-popup" />').appendTo(document.body);
  }

  var PopupView = {
    init: function() {
      this.reset();
      this.popupDiv = createPopupDiv();
    },

    /**
      Tells the PopupView to display the popup with text.
      The options object MUST include a hoverEvent property that represents the mouseenter.
      @param {string} text - the text to be displayed in the popup
      @param {object} options - a set of options to configure the popup
      @param {object} options.hoverEvent - a MouseEvent desciribing a mouseenter event
      @param {boolean} override - forces the popup to be drawn regardless of cancel controls
    */
    show: function(text, options, override) {
      this.cancelShow = false;
      this.cancelHide = true;
      this.override = override;
      var hoverEvent = options.hoverEvent;
      var offset = hoverEvent.pageX + 10; // offset from cursor so it doesn't interfere with clicking
      this.X = override ? offset : this.X || offset;
      this.Y = override ? hoverEvent.pageY : this.Y || hoverEvent.pageY;

      if (options.width) {
        this.popupDiv.css('width', options.width);
      }
      this.popupDiv.html(text);

      if (this.X + this.popupDiv.width() > $(window).width()) {
        this.X -= this.popupDiv.width();
      }

      showPopup = function() {
        if (this.override || !this.cancelShow) {
          this.popupDiv.css({'left': this.X, 'top': this.Y});
          this.popupDiv.show();
        }
      };
      setTimeout(showPopup.bind(this), options.showDelay || 150);
    },

    /*
    Hides the PopupView.
    Sets the cacnelShow property of the state of the PopupView to true,
    this prevents the popup from showing if the user has already mouseleft.
    */
    hide: function(options) {
      options = options || {};
      this.cancelShow = true;
      this.cancelHide = false;
      var hidePopup = function() {
        if (!this.cancelHide) {
          this.popupDiv.hide();
          this.reset();
        }
      };
      setTimeout(hidePopup.bind(this), options.hideDelay || 200);
    },

    updateText: function(text) {
      this.popupDiv.html(text.replace(/\n/g, '<br />'));
    },

    setDelegateAndIdentifier: function(delegate, identifier) {
      this.delegate = delegate;
      this.identifier = identifier;
    },

    getTarget: function() {
      return this.delegate;
    },

    reset: function() {
      this.X = null;
      this.Y = null;
      this.delegate = null;
      this.identifier = null;
      this.override = null;
    }
  };

  return PopupView;

});