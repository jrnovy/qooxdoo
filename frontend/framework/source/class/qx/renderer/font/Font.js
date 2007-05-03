/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_basic)

************************************************************************ */

/** Font implementation for qx.ui.core.Widget instances. */
qx.Class.define("qx.renderer.font.Font",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(size, family)
  {
    this.base(arguments);

    if (size !== undefined) {
      this.setSize(size);
    }

    if (family !== undefined) {
      this.setFamily(family);
    }

    this.initWrap();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Converts a typical CSS font definition string to an font object
     *
     * @type static
     * @param str {String} the CSS string
     * @return {qx.renderer.font.Font} the created instance
     */
    fromString : function(str)
    {
      var font = new qx.renderer.font.Font;
      var parts = str.split(/\s+/);
      var name = [];
      var part;

      for (var i=0; i<parts.length; i++)
      {
        switch(part = parts[i])
        {
          case "bold":
            font.setBold(true);
            break;

          case "italic":
            font.setItalic(true);
            break;

          case "underline":
            font.setUnderline(true);
            break;

          case "strikeout":
            font.setStrikeout(true);
            break;

          default:
            var temp = parseFloat(part);

            if (temp == part || qx.lang.String.contains(part, "px")) {
              font.setSize(temp);
            } else {
              name.push(part);
            }

            break;
        }
      }

      if (name.length > 0) {
        font.setName(name.join(" "));
      }

      return font;
    },


    /**
     * Converts a map property definition into a border object.
     *
     * @type static
     * @param config {Map} map of property values
     * @return {qx.renderer.border.Border} the created instance
     */
    fromConfig : function(config)
    {
      var font = new qx.renderer.font.Font;
      font.set(config);
      return font;
    },


    reset : function(widget)
    {
      widget.removeStyleProperty("fontFamily");
      widget.removeStyleProperty("fontSize");
      widget.removeStyleProperty("fontWeight");
      widget.removeStyleProperty("fontStyle");
      widget.removeStyleProperty("textAlign");
      widget.removeStyleProperty("whiteSpace");
      widget.removeStyleProperty("textDecoration");
      widget.removeStyleProperty("textTransform");
      widget.removeStyleProperty("letterSpacing");
      widget.removeStyleProperty("wordSpacing");
      widget.removeStyleProperty("lineHeight");
    },

    resetElement : function(element)
    {
      var style = element.style;

      style.fontFamily = "";
      style.fontSize = "";
      style.fontWeight = "";
      style.fontStyle = "";
      style.textAlign = "";
      style.whiteSpace = "";
      style.textDecoration = "";
      style.textTransform = "";
      style.letterSpacing = "";
      style.wordSpacing = "";
      style.lineHeight = "";
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    size :
    {
      check : "Integer",
      nullable : true,
      apply : "_applySize"
    },

    family :
    {
      check : "Array",
      nullable : true,
      apply : "_applyFamily"
    },

    bold :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyBold"
    },

    italic :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyItalic"
    },

    align :
    {
      check : [ "left", "center", "right", "justify" ],
      nullable : true
    },

    wrap :
    {
      check : "Boolean",
      init : false,
      nullable : true,
      apply : "_applyWrap"
    },

    decoration :
    {
      check : [ "underline", "line-through", "overline" ],
      nullable : true
    },

    transform :
    {
      check : [ "lowercase", "capitalize", "uppercase" ],
      nullable : true
    },

    letterSpacing :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLetterSpacing"
    },

    wordSpacing :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyWordSpacing"
    },

    lineHeight :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLineHeight"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __size : null,
    __family : null,
    __bold : null,
    __italic : null,
    __wrap : null,
    __letterSpacing : null,
    __wordSpacing : null,
    __lineHeight : null,

    _applySize : function(value, old) {
      this.__size = value === null ? null : value + "px";
    },

    _applyFamily : function(value, old) {
      this.__family = value ? '"' + value.join('","') + '"' : null;
    },

    _applyBold : function(value, old) {
      this.__bold = value === null ? null : value ? "bold" : "normal";
    },

    _applyItalic : function(value, old) {
      this.__italic = value === null ? null : value ? "italic" : "normal";
    },

    _applyWrap : function(value, old) {
      this.__wrap = value === null ? null : value ? "normal" : "nowrap";
    },

    _applyLetterSpacing : function(value, old) {
      this.__letterSpacing = value === null ? null : value + "px";
    },

    _applyWordSpacing : function(value, old) {
      this.__wordSpacing = value === null ? null : value + "px";
    },

    _applyLineHeight : function(value, old) {
      this.__lineHeight = value === null ? null : value + "px";
    },

    render : function(widget)
    {
      widget.setStyleProperty("fontFamily", this.__family);
      widget.setStyleProperty("fontSize", this.__size);
      widget.setStyleProperty("fontWeight", this.__bold);
      widget.setStyleProperty("fontStyle", this.__italic);
      widget.setStyleProperty("textAlign", this.getAlign());
      widget.setStyleProperty("whiteSpace", this.__wrap);
      widget.setStyleProperty("textDecoration", this.getDecoration());
      widget.setStyleProperty("textTransform", this.getTransform());
      widget.setStyleProperty("letterSpacing", this.__letterSpacing);
      widget.setStyleProperty("wordSpacing", this.__wordSpacing);
      widget.setStyleProperty("lineHeight", this.__lineHeight);
    },

    renderElement : function(element)
    {
      var style = element.style;
      style.fontFamily = this.__family || "";
      style.fontSize = this.__size || "";
      style.fontWeight = this.__bold || "";
      style.fontStyle =  this.__italic || "";
      style.textAlign = this.getAlign() || "";
      style.whiteSpace = this.__wrap || "";
      style.textDecoration = this.getDecoration() || "";
      style.textTransform = this.getTransform() || "";
      style.letterSpacing = this.__letterSpacing || "";
      style.wordSpacing = this.__wordSpacing || "";
      style.lineHeight = this.__lineHeight || "";
    }
  }
});
