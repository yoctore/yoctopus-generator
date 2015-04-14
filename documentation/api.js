YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Main"
    ],
    "modules": [
        "configuring",
        "initializing",
        "install",
        "mainModuleYoctoStackGenerator",
        "prompting",
        "writing"
    ],
    "allModules": [
        {
            "displayName": "configuring",
            "name": "configuring",
            "description": "Handle configuration : make all directory ..."
        },
        {
            "displayName": "initializing",
            "name": "initializing",
            "description": "Initializing, load .json config files"
        },
        {
            "displayName": "install",
            "name": "install",
            "description": "Install all dependencies : npm and Bower"
        },
        {
            "displayName": "mainModuleYoctoStackGenerator",
            "name": "mainModuleYoctoStackGenerator",
            "description": "We extend a parent generator of yeoman to create our own generator"
        },
        {
            "displayName": "prompting",
            "name": "prompting",
            "description": "Handle user intereactions"
        },
        {
            "displayName": "writing",
            "name": "writing",
            "description": "Generate specifics files : package.json, routes..."
        }
    ]
} };
});