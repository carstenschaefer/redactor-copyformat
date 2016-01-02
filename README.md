# redactor-copyformat
Redactor plugin for copy formatting of text in editor and applying to another text in editor

##Requirements
Font Awesome is required.

##Features:
* Copies formatting of current selection or current word where caret is in.
* Applies the formatting to a new selection or a current word where the caret is in. 

A plugin developed for [Redactor](http://imperavi.com/redactor/), a WYSIWYG rich-text editor made by [imperavi](http://imperavi.com/).

Feel free to contribute to this repository.

##Installation

Include copyformat.js, RedactorCallbacksFix.js, RedactorBoldItalicFix.js and fontawesome in your markup:

```html
<link rel="stylesheet" type="text/css" href="font-awesome/css/font-awesome.min.css" />
<script type="text/javascript" src="RedactorCallbacksFix.js"></script>
<script type="text/javascript" src="RedactorBoldItalicFix.js"></script>
<script type="text/javascript" src="copyformat.js"></script>
```

##Usage
Configuration via HTML markup:

```javascript
$(function() {
      $("#editor").redactor({
        plugins: ['callbacksFix', 'fontFamily', 'fontSize', 'copyFormat', 'fontcolor', 'boldItalicFix'],
        allowedAttr: [
          ["strong", "style"],
          ["em", "style"],
          ["b", "style"],
          ["i", "style"]
        ],
        fontFamily: {
          defaultFont: 'Georgia',
          fonts: {
            'Arial': 'Arial, Helvetica, sans-serif',
            'Comic Sans MS': "'Comic Sans MS', cursive, sans-serif",
            'Georgia': 'Georgia, serif',
            'Times New Roman': "'Times New Roman', Times, serif"
          }
        },
        fontSize: {
          defaultSize: "18"
        }
    });
});
 ````
 


