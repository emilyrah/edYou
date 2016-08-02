// DO NOT DELETE : this gist is referenced by a live article
// https://www.tropo.com/2016/06/devops-follow-tropo-spark/
// Cisco Spark Logging Library for Tropo
//

// Factory for the Spark Logging Library, with 2 parameters
//    - the name of the application will prefix all your logs, 
//    - the Spark Incoming integration (to  which logs will be posted)
// To create an Incoming Integration
//   - click integrations in the right pane of a Spark Room (Example : I create a dedicated "Tropo Logs" room)
//   - select incoming integration
//   - give your integration a name, it will be displayed in the members lists (Example : I personally named it "from tropo scripting")
//   - copy your integration ID, you'll use it to initialize the SparkLibrary
function SparkLog(appName, incomingIntegrationID) {
    
    if (!appName) {
        log("SPARK_LOG : bad configuration, no application name, exiting...");
        throw createError("SparkLibrary configuration error: no application name specified");
    }
        this.tropoApp = appName;

    if (!incomingIntegrationID) {
        log("SPARK_LOG : bad configuration, no Spark incoming integration URI, exiting...");
        throw createError("SparkLibrary configuration error: no Spark incoming integration URI specified");
    }
        this.sparkIntegration = incomingIntegrationID;
        
    log("SPARK_LOG: all set for application:" + this.tropoApp + ", posting to integrationURI: " + this.sparkIntegration);
}

// This function sends the log entry to the registered Spark Room 
// Invoke this function from the Tropo token-url with the "sparkIntegration" parameter set to the incoming Webhook ID you'll have prepared
// Returns true if the log entry was acknowledge by Spark (ie, got a 2xx HTTP status code)
SparkLog.prototype.log = function(newLogEntry) {
    
    // Robustify
    if (!newLogEntry) {
        newLogEntry = "";
    }
    
    var result;
    try {
        // Open Connection
        var url = "https://api.ciscospark.com/v1/webhooks/incoming/" + this.sparkIntegration;
        connection = new java.net.URL(url).openConnection();

        // Set timeout to 10s
        connection.setReadTimeout(10000);
        connection.setConnectTimeout(10000);

        // Method == POST
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        
        // TODO : check if this cannot be removed
        connection.setRequestProperty("Content-Length", newLogEntry.length);
        connection.setUseCaches (false);
        connection.setDoInput(true);
        connection.setDoOutput(true); 

        //Send Post Data
        bodyWriter = new java.io.DataOutputStream(connection.getOutputStream());
        log("SPARK_LOG: posting: " + newLogEntry + " to: " + url);
        contents = '{ "text": "' + this.tropoApp + ': ' + newLogEntry + '" }'
        bodyWriter.writeBytes(contents);
        bodyWriter.flush ();
        bodyWriter.close (); 

        result = connection.getResponseCode();
        log("SPARK_LOG: read response code: " + result);

    if(result < 200 || result > 299) {
            log("SPARK_LOG: could not log to Spark, message format not supported");
            return false;
     }
    }
    catch(e) {
        log("SPARK_LOG: could not log to Spark, socket Exception or Server Timeout");
        return false;
    }
    
    log("SPARK_LOG: log successfully sent to Spark, status code: " + result);
    return true; // success
}

// Store strings of rooms
var tropo_log = "ENTER PERSONAL ROOM ID";


// Let's create several instances for various log levels
// Note that you may spread logs to distinct rooms by changing the integrationId
var SparkInfo = new SparkLog("EdYou - INFO:", tropo_log);
var SparkDebug = new SparkLog("EdYou - DEBUG:", tropo_log);


//
// Log Configuration happens here
//

// info level used to get a synthetic sump up of what's happing
function info(logEntry) {
  log("INFO " + logEntry);
  SparkInfo.log(logEntry);
  // Uncomment if you opt to go for 2 distinct Spark Rooms for DEBUG and INFO log levels
  //SparkDebug.log(logEntry); 
}

// debug level used to get detail informations
function debug(logEntry) {
  log("DEBUG: " + logEntry);
  SparkDebug.log(logEntry);
}


// END OF CODE FROM https://gist.github.com/ObjectIsAdvantag/b73db0cffcedb1152a2d6669cb3d27b0
// START OF DEVELOPED CODE


result = ask("Hello, this is San Jose Elementary School. Press 1 if you want to report a student and press 2 if you want to make a maintenance repot", {
    choices:"[1 DIGIT]",
    attempts:5
});
var digit = result.value;
if (digit == 1){
    aborleave = ask("Press 1 if the student is absent and press 2 if the student is leaving campus", {
        choices: "1,2",
        attempts:5
    });
    id =ask("What is the student I.D.?", {
        choices: "[5 DIGITS]", 
        attempts:5
    });
    say("The I.D. is " + id.value);
    info("Case Type: " + aborleave.value + " Student: " + id.value);
    hangup();
    call("+ENTERPHONENUMBER", {
        network:"SMS"});
        if (aborleave.value == 1){
            say("Your child, " + id.value + ", is absent from school today");
        } else {
           say("Your child, " + id.value + ", left school"); 
        }
    
} else {
    repair = ask("What is the maintenance report you want to make? Press 1 for repairs, press 2 for replacements, and press 3 for suggestions", {
        choices:"1,2,3",
        attempts:5
    });
    contact = ask("What is the number we can get back to you on?", {
        choices: "[10 DIGITS]",
        attempts: 5
    });
    say("Thanks for reporting a problem about " + repair.value + ". Have a nice day!");
    hangup();

    debug("Problem: " + repair.value + " and number: " + contact.value);
}
