if (!RedactorPlugins) var RedactorPlugins = {};

(function($){
    var defaults = ["color", "fontWeight", "fontStyle", "fontFamily", "fontSize", "backgroundColor"];
    var properties = [];
    RedactorPlugins.copyFormat = function(){
        return {
            init: function(){
                var buttonCopy = this.button.add('copyFormat', "Copy Format");
                this.button.addCallback(buttonCopy, this.copyFormat.copy);
                
                this.$editor.on("mouseup", this.copyFormat.paste);
                this.$editor.on("keyup", this.copyFormat.cancel);
            },
            cancel: function(e){
                var key = e.which || e.keyCode;
                if(key === 27 && this.$editor.hasClass('eyedropper')){
                    this.copy(e);
                }
            },
            copy: function(e){
                // Range is not available when redactor does not have focus, so do nothing.
                if(!this.range) return;
                
                // If the redactor already has .eyedropper class when CopyFormat button is clicked,
                // it means user wants to cancel the copy operation.
                if(this.$editor.hasClass("eyedropper")){
                    // Remove eyedropper class.
                    this.$editor.removeClass("eyedropper");
                    
                    // Show the button as Inactive.
                    this.button.setInactive("copyFormat");
                
                    // Clear the array.
                    properties.splice(0, properties.length);
                    
                    // No need to continue as operation has been cancelled.
                    return;
                }
                
                var element = null;
                
                if(this.range.collapsed){
                    // It means there is no selection. Get either inline or block whichever is relevant.                    
                    // Get the element that appear in current caret position.
                    element = this.selection.getParent();
                }
                else{
                    element = this.selection.getNodes()[0];
                }
                
                if(!element){
                    // Somehow this.range could return a valid object having document as a container when there is no focus in redactor.
                    // So this.selection.getParent() may return false and we need to do nothing.
                    return;
                }
                
                
                
                // Get the styles associated with the element. This is a big list that also includes
                // vendor specific properties.
                var styles = window.getComputedStyle(element, null);
                
                // A local that temporarily stores name of property for a brief moment.
                // No use of it outside the following loop.
                var name;
                
                // Loop through each block of array.
                for(var index = 0; index < defaults.length; index++){
                    
                    // Get the name of property available at given index.
                    name = defaults[index];
                    
                    if(defaults[index] === "backgroundColor"){
                        // Property background color requires a special attention.
                        // As background color does not inherit, we need to traverse through reverse hierarchy
                        // upto the Redactor's div element to check if there is background color set in any of
                        // parent element.
                        
                        // Get the current element's jquery object.
                        var temp = $(element);
                        var isSet = false;
                        
                        // Loop until the id of element matches with id of redactor.
                        while(temp[0].id !== this.$editor[0].id && temp.length > 0){
                            // Get the background color of element.
                            var bgColor = temp[0].style.backgroundColor;
                            
                            if(bgColor !== ""){
                                // Background color is set exclusively.
                                isSet = true;
                                
                                // Add the background color in properties collection.
                                properties.push({ name: name, value : bgColor });
                                
                                // No need to continue the loop. Break the execution.
                                break;
                            }
                            
                            // Background color not found. So get the parent.
                            temp = temp.parent();
                        }
                        
                        if(!isSet){
                            // Background color is not set in the loop above.
                            // So add the background color available in styles collection.
                            properties.push({ name: name, value : styles[name] });
                        }
                    }
                    else{
                        // Add a new object containing property name and its value in array.
                        // We can call it property object, having name and value properties.
                        properties.push({ name: name, value : styles[name] });
                    }
                }
                
                // Show the dropper icon in redactor.
                this.$editor.addClass('eyedropper');
                
                // Show the button as Active.
                this.button.setActive("copyFormat");
            },
            paste: function(e){
                // Check if range is available or properties are available.
                // If both are null or empty, no need to continue.
                if(!this.range || properties.length === 0)
                    return;

                var element = null;
                
                /* It is not required at the moment as we have changed the code to format
                 * on either selected text or current word.
                // Range could be collapsed when there is no selection. In this case, set the properties on parent element.
                // Otherwise wrap the selection around <span> tag and set the properties in it.
                
                if(this.range.collapsed)
                    element = this.selection.getParent();
                else
                    element = this.selection.wrap("span");
                */

                // Get the element at caret position. This could be a newly created span tag or existing parent of current text node.
                // Alternative method (not useful) is commented above.
                element = this.copyFormat.getElementAtCaret();
                
                // Make sure that element is either available or created (span tag).
                if(element){                    
                    for(var index = 0; index < properties.length; index++){
                        // Get the property object at given index. 
                        var prop = properties[index];
                        
                       if(prop.name === "backgroundColor" && prop.value.replace(/\s/g, '') === "rgba(0,0,0,0)"){
                            element.style[prop.name] = "rgb(255,255,255)";
                        }
                        else{
                            element.style[prop.name] = prop.value;
                        }
                    }
                }
                
                // Set the caret position after last character of element.
                this.caret.setEnd(element);
                
                // Clear the array.
                properties.splice(0, properties.length);
                
                // Remove the dropper icon from redactor.
                this.$editor.removeClass('eyedropper');
                
                // Show the button as Inactive.
                this.button.setInactive("copyFormat");
            },
            getElementAtCaret: function(){
                // Gets either a new element, or inline element available at caret position.
                var span;
                
                if(this.range.collapsed){
                    // The text is not selected. So determine the word where the caret is placed and select it.
                    
                    // Get the value of node which has focus. This value could have one or more words.
                    var text = this.sel.focusNode.nodeValue;
                    
                    // this.sel.focusOffset returns the position of caret in respect to text node.
                    // Get the index position of whitespace before and after the word.
                    // Once the position is determined, we can select the word.
                    var startPos = text.lastIndexOf(' ', this.sel.focusOffset) + 1;
                    var endPos = text.indexOf(' ', this.sel.focusOffset);

                    if(endPos === -1){
                        // It happens when the word is last in sequence and there is no space available after it.
                        endPos = text.length;
                    }
                    
                    // It is possible that the node already has single word.
                    // In this case we can assume that the tag in which the text node resides is inline.
                    // But still make sure.
                    if(startPos === 0 && endPos === text.length){
                        // Get the element at cursor position.
                        span = this.selection.getCurrent();
                        
                        if(span.nodeType === 3){
                            // The current node at cursor position could be a text node. So get its parent.
                            span = span.parentNode;
                        }
                        
                        // Get the style values of current element.
                        var styles = window.getComputedStyle(span, null);
                        
                        // Check if it is inline element.
                        if(styles["display"].toLowerCase() === "inline"){
                            // We found current element as inline element. Let the format be set on it.
                            // This inline element could be strong, em, or span element.
                            return span;
                        }
                    }
                
                    // At this position, we have not found any inline element that could have only one word at caret position.
                    // So select the word between given offsets.
                    this.range.setStart(this.sel.focusNode, startPos);
                    this.range.setEnd(this.sel.focusNode, endPos);
                    this.selection.addRange();
                }
                
                // So far we have selection of text. This selection could be initiated by user or the code above.
                // A new span tag is created around selection.
                span = this.selection.wrap('span');
                
                // Redactor seems to clean the HTML, which sometimes remove style attribute.
                // Setting following attribute will tell redactor to not clean anything on our span tag.
                span.setAttribute("data-redactor-tag", "span");
                span.setAttribute("data-verified", "redactor");
                
                // Return this span.
                return span;
            }
        };
    };
})(jQuery);
