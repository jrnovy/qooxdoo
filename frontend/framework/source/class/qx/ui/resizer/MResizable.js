/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 David Pérez Carmona
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez Carmona (david-perez)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Provides resizing behavior to any widget.
 * The widget that includes this mixin, must implement the {@link qx.ui.resizer.IResizable} interface.
 */
qx.Mixin.define("qx.ui.resizer.MResizable",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(child)
  {
    this._frame = new qx.ui.basic.Terminator;
    this._frame.setAppearance("resizer-frame");
    this.addEventListener("mousedown", this._onmousedown);
    this.addEventListener("mouseup", this._onmouseup);
    this.addEventListener("mousemove", this._onmousemove);
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** It is resizable in the left direction. */
    resizableWest :
    {
      check : "Boolean",
      init : true,
      apply : "_applyResizable"
    },


    /** It is resizable in the top direction. */
    resizableNorth :
    {
      check : "Boolean",
      init : true,
      apply : "_applyResizable"
    },


    /** It is resizable in the right direction. */
    resizableEast :
    {
      check : "Boolean",
      init : true,
      apply : "_applyResizable"
    },


    /** It is resizable in the bottom direction. */
    resizableSouth :
    {
      check : "Boolean",
      init : true,
      apply : "_applyResizable"
    },


    /** If the window is resizable */
    resizable :
    {
      group : [ "resizableNorth", "resizableEast", "resizableSouth", "resizableWest" ],
      mode  : "shorthand"
    },


    /** The resize method to use */
    resizeMethod :
    {
      init : "frame",
      check : [ "opaque", "lazyopaque", "frame", "translucent" ],
      event : "changeResizeMethod"
    }
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Adjust so that it returns a boolean instead of an array.
     *
     * @type member
     * @return {Boolean} TODOC
     */
    isResizable : function() {
      return this.getResizableWest() || this.getResizableEast() || this.getResizableNorth() || this.getResizableSouth();
    },


    /**
     * Adjust so that it returns a boolean instead of an array.
     * Wrapper around isResizable. Please use isResizable instead.
     *
     * @type member
     * @return {Boolean} TODOC
     */
    getResizable : function() {
      return this.isResizable();
    },



    _applyResizable : function(value, old) {
      // placeholder
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e)
    {
      if (this._resizeNorth || this._resizeSouth || this._resizeWest || this._resizeEast)
      {
        // enable capturing
        this.setCapture(true);

        // activate global cursor
        this.getTopLevelWidget().setGlobalCursor(this.getCursor());

        // caching element
        var el = this.getElement();

        // measuring and caching of values for resize session
        var pa = this._getResizeParent();
        var pl = pa.getElement();

        var parentLocation = qx.html2.Location.get(pl);
        var elementLocation = qx.html2.Location.get(el);

        // handle frame and translucently
        switch(this.getResizeMethod())
        {
          case "translucent":
            this.setOpacity(0.5);
            break;

          case "frame":
            var f = this._frame;

            if (f.getParent() != pa)
            {
              f.setParent(pa);
              qx.ui.core.Widget.flushGlobalQueues();
            }

            f._renderRuntimeLeft(elementLocation.left - parentLocation.left);
            f._renderRuntimeTop(elementLocation.top - parentLocation.top);

            f._renderRuntimeWidth(qx.html.Dimension.getBoxWidth(el));
            f._renderRuntimeHeight(qx.html.Dimension.getBoxHeight(el));

            f.setZIndex(this.getZIndex() + 1);

            break;
        }

        // create resize session
        var s = this._resizeSession = {};
        var minRef = this._getMinSizeReference();

        if (this._resizeWest)
        {
          s.boxWidth = qx.html.Dimension.getBoxWidth(el);
          s.boxRight = elementLocation.right;
        }

        if (this._resizeWest || this._resizeEast)
        {
          s.boxLeft = elementLocation.left;

          s.parentAreaOffsetLeft = parentLocation.left;
          s.parentAreaOffsetRight = parentLocation.right;

          s.minWidth = minRef.getMinWidthValue();
          s.maxWidth = minRef.getMaxWidthValue();
        }

        if (this._resizeNorth)
        {
          s.boxHeight = qx.html.Dimension.getBoxHeight(el);
          s.boxBottom = elementLocation.bottom;
        }

        if (this._resizeNorth || this._resizeSouth)
        {
          s.boxTop = elementLocation.top;

          s.parentAreaOffsetTop = parentLocation.top;
          s.parentAreaOffsetBottom = parentLocation.bottom;

          s.minHeight = minRef.getMinHeightValue();
          s.maxHeight = minRef.getMaxHeightValue();
        }
      }
      else
      {
        // cleanup resize session
        delete this._resizeSession;
      }

      // stop event
      e.stopPropagation();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e)
    {
      var s = this._resizeSession;

      if (s)
      {
        // disable capturing
        this.setCapture(false);

        // deactivate global cursor
        this.getTopLevelWidget().setGlobalCursor(null);

        // sync sizes to frame
        switch(this.getResizeMethod())
        {
          case "frame":
            var o = this._frame;

            if (!(o && o.getParent())) {
              break;
            }

            // no break here

          case "lazyopaque":
            if (s.lastLeft != null) {
              this.setLeft(s.lastLeft);
            }

            if (s.lastTop != null) {
              this.setTop(s.lastTop);
            }

            if (s.lastWidth != null)
            {
              this._changeWidth(s.lastWidth);
            }

            if (s.lastHeight != null)
            {
              this._changeHeight(s.lastHeight);
            }

            if (this.getResizeMethod() == "frame") {
              this._frame.setParent(null);
            }

            break;

          case "translucent":
            this.setOpacity(null);
            break;
        }

        // cleanup session
        delete this._resizeSession;
      }

      // stop event
      e.stopPropagation();
    },


    /**
     * TODOC
     *
     * @type member
     * @param p {var} TODOC
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    _near : function(p, e) {
      return e > (p - 5) && e < (p + 5);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousemove : function(e)
    {
      var s = this._resizeSession;

      if (s)
      {
        if (this._resizeWest)
        {
          s.lastWidth = qx.lang.Number.limit(s.boxWidth + s.boxLeft - Math.max(e.getPageX(), s.parentAreaOffsetLeft), s.minWidth, s.maxWidth);
          s.lastLeft = s.boxRight - s.lastWidth - s.parentAreaOffsetLeft;
        }
        else if (this._resizeEast)
        {
          s.lastWidth = qx.lang.Number.limit(Math.min(e.getPageX(), s.parentAreaOffsetRight) - s.boxLeft, s.minWidth, s.maxWidth);
        }

        if (this._resizeNorth)
        {
          s.lastHeight = qx.lang.Number.limit(s.boxHeight + s.boxTop - Math.max(e.getPageY(), s.parentAreaOffsetTop), s.minHeight, s.maxHeight);
          s.lastTop = s.boxBottom - s.lastHeight - s.parentAreaOffsetTop;
        }
        else if (this._resizeSouth)
        {
          s.lastHeight = qx.lang.Number.limit(Math.min(e.getPageY(), s.parentAreaOffsetBottom) - s.boxTop, s.minHeight, s.maxHeight);
        }

        switch(this.getResizeMethod())
        {
          case "opaque":
          case "translucent":
            if (this._resizeWest || this._resizeEast)
            {
              this.setWidth(s.lastWidth);

              if (this._resizeWest) {
                this.setLeft(s.lastLeft);
              }
            }

            if (this._resizeNorth || this._resizeSouth)
            {
              this.setHeight(s.lastHeight);

              if (this._resizeNorth) {
                this.setTop(s.lastTop);
              }
            }

            break;

          default:
            var o = this.getResizeMethod() == "frame" ? this._frame : this;

            if (this._resizeWest || this._resizeEast)
            {
              o._renderRuntimeWidth(s.lastWidth);

              if (this._resizeWest) {
                o._renderRuntimeLeft(s.lastLeft);
              }
            }

            if (this._resizeNorth || this._resizeSouth)
            {
              o._renderRuntimeHeight(s.lastHeight);

              if (this._resizeNorth) {
                o._renderRuntimeTop(s.lastTop);
              }
            }
        }
      }
      else
      {
        var resizeMode = "";
        var el = this.getElement();

        this._resizeNorth = this._resizeSouth = this._resizeWest = this._resizeEast = false;

        if (this._near(qx.html2.Location.get(el).top, e.getPageY()))
        {
          if (this.getResizableNorth())
          {
            resizeMode = "n";
            this._resizeNorth = true;
          }
        }
        else if (this._near(qx.html2.Location.get(el).bottom, e.getPageY()))
        {
          if (this.getResizableSouth())
          {
            resizeMode = "s";
            this._resizeSouth = true;
          }
        }

        if (this._near(qx.html2.Location.get(el).left, e.getPageX()))
        {
          if (this.getResizableWest())
          {
            resizeMode += "w";
            this._resizeWest = true;
          }
        }
        else if (this._near(qx.html2.Location.get(el).right, e.getPageX()))
        {
          if (this.getResizableEast())
          {
            resizeMode += "e";
            this._resizeEast = true;
          }
        }

        if (this._resizeNorth || this._resizeSouth || this._resizeWest || this._resizeEast) {
          this.setCursor(resizeMode + "-resize");
        } else {
          this.resetCursor();
        }
      }

      // stop event
      e.stopPropagation();
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_frame");
  }
});
