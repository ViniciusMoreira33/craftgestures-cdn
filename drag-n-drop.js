document.addEventListener('DOMContentLoaded', function() {
    // Dynamically load interact.js
    var interactScript = document.createElement('script');
    interactScript.src = 'https://cdn.jsdelivr.net/gh/ViniciusMoreira33/interact.js@main/interactJS.js';
    interactScript.onload = function() {
        // Once interact.js is loaded, initialize drag-and-drop
        initializeDragAndDrop();
    };
    document.head.appendChild(interactScript);
});

function initializeDragAndDrop() {
    // Ensure the settings object exists
    if (typeof window.dragDropSettings === 'undefined') {
        console.error('DragDrop settings object is not defined.');
        return;
    }

    const settings = window.dragDropSettings;
    const targetElement = document.querySelector(settings.targetElement);

    // Ensure touch-action is set to none to prevent default touch behaviors
    targetElement.style.touchAction = 'none';

    if (!targetElement) {
        console.error('DragDrop: Target element specified in settings not found.');
        return;
    }

    // Define the holding time in milliseconds
    const holdingTime = 200; // Set to 200ms as per your requirement

    // Capture initial styles
    const initialStyles = {
        color: targetElement.style.color,
        backgroundColor: targetElement.style.backgroundColor,
        border: targetElement.style.border,
        borderRadius: targetElement.style.borderRadius,
        transition: targetElement.style.transition,
        rotate: targetElement.style.transform // Assuming rotate is a transform
    };

    // Apply styles function
    function applyStyles(element, styles) {
        for (const property in styles) {
            if (styles[property] !== "") {
                element.style[property] = styles[property];
            } else {
                // If the style should be cleared (empty string), revert to the initial style
                element.style[property] = initialStyles[property];
            }
        }
    }

    // Add event listeners for 'mousedown' or 'touchstart' to apply 'holding' state after a delay
    targetElement.addEventListener('mousedown', function(event) {
        // Clear any existing timeout to avoid multiple triggers
        clearTimeout(event.target.dataset.holdingTimeout);
        // Initialize isMoving to false every time the user presses down
        event.target.dataset.isMoving = "false";
        event.target.dataset.holdingTimeout = setTimeout(() => {
            // Only apply 'holding' styles if the element hasn't started dragging
            if (event.target.dataset.isMoving === "false") {
                applyStyles(event.target, settings.states.holding);
            }
        }, holdingTime);
    });
    targetElement.addEventListener('touchstart', function(event) {
        // Clear any existing timeout to avoid multiple triggers
        clearTimeout(event.target.dataset.holdingTimeout);
        // Initialize isMoving to false every time the user touches down
        event.target.dataset.isMoving = "false";
        event.target.dataset.holdingTimeout = setTimeout(() => {
            // Only apply 'holding' styles if the element hasn't started dragging
            if (event.target.dataset.isMoving === "false") {
                applyStyles(event.target, settings.states.holding);
            }
        }, holdingTime);
    });

    // Add event listeners for 'mouseup' or 'touchend' to clear the holding state if not held long enough or if dragging did not start
    targetElement.addEventListener('mouseup', function(event) {
        clearTimeout(event.target.dataset.holdingTimeout);
        if (event.target.dataset.isMoving === "false") {
            // Revert to initial styles
            applyStyles(event.target, initialStyles);
        }
        event.target.dataset.isMoving = "false";
    });
    targetElement.addEventListener('touchend', function(event) {
        clearTimeout(event.target.dataset.holdingTimeout);
        if (event.target.dataset.isMoving === "false") {
            // Revert to initial styles
            applyStyles(event.target, initialStyles);
        }
        event.target.dataset.isMoving = "false";
    });

    // Initialize drag-and-drop functionality with inertia enabled
    interact(targetElement).draggable({
        inertia: true, // Enable inertia for smoother ending of drag
        autoScroll: true, // Enable autoScroll for smooth dragging when near edges
        listeners: {
            start(event) {
                // Now that dragging has started, we apply 'dragging' styles
                applyStyles(event.target, settings.states.dragging);
                // Flag to track if the element has been moved
                event.target.dataset.isMoving = false;
            },
            move(event) {
                // Check if the element has started moving
                if (event.dx !== 0 || event.dy !== 0) {
                    if (event.target.dataset.isMoving === "false") {
                        // Apply 'dragging' styles once the element starts moving
                        applyStyles(event.target, settings.states.dragging);
                        event.target.dataset.isMoving = true;
                    }
                    dragMoveListener(event);
                }
            },
            end(event) {
                applyStyles(event.target, settings.states.dropping);
                // Retrieve the dropping duration from the settings
                const droppingDuration = parseInt(settings.states.dropping.droppingDuration) || 0;
                setTimeout(() => {
                    applyStyles(event.target, settings.states.dropped);
                }, droppingDuration); 
            }
        },
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent', // Default to 'parent', can be customized in settings if needed
                endOnly: true
            })
        ]
    });

    // Function to handle the drag movement updates
    function dragMoveListener(event) {
        const target = event.target;
        // Keep the dragged position in the data-x/data-y attributes
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Translate the element
        target.style.transform = `translate(${x}px, ${y}px)`;

        // Update the position attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    // Make the dragMoveListener globally accessible
    window.dragMoveListener = dragMoveListener;
};
