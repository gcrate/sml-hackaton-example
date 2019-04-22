package com.sincemylast.api;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.amazonaws.util.StringUtils;
import com.squareup.okhttp.MediaType;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.RequestBody;
import com.squareup.okhttp.Response;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;
import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;

/**
 *
 * @author grahamcrate
 */
public class ApiHandler extends AbstractHandler implements RequestStreamHandler {

    public static final String NEXMO_API_KEY = System.getenv("NEXMO_API_KEY");
    public static final String NEXMO_API_SECRET = System.getenv("NEXMO_API_SECRET");
    public static final String NEXMO_PHONE_NUM = System.getenv("NEXMO_PHONE_NUM");

    private static final String DYNAMO_TABLE = "since-my-last-data";

    private static final String FIELD_PHONE = "phone";
    private static final String FIELD_NAME = "name";
    private static final String FIELD_UUID = "uuid";
    private static final String FIELD_PIN = "pin";
    private static final String FIELD_GOAL = "goal";
    private static final String FIELD_SECRET = "secret";
    private static final String FIELD_FRIEND = "friend";
    private static final String FIELD_COUNT = "count";
    private static final String FIELD_REPORTED = "reported";
    private static final String FIELD_ACTION = "action";
    private static final String FIELD_ALLOW_REPORT = "allowReport";

    private static final String ACTION_SUCCESS = "success";
    private static final String ACTION_RESET = "reset";

    private static final SimpleDateFormat SDF = new SimpleDateFormat("yyyy-MM-dd");

    private final AmazonDynamoDB dynamoDbClient = AmazonDynamoDBClientBuilder.standard()
            .withRegion(Regions.US_EAST_1)
            .build();

    private LambdaLogger logger;

    @Override
    public void handleRequest(InputStream inputStream, OutputStream outputStream, Context context) throws IOException {

        //If this was a real app we'd deal with dates better, but fixed at EST for a hackathon makes life easier
        TimeZone.setDefault(TimeZone.getTimeZone("EST"));
        
        logger = context.getLogger();

        JSONObject jsonResponse = new JSONObject();

        try {
            InboundRequest iReq = getInboundRequest(inputStream);

            switch (iReq.getPath()) {
                case "/register":
                    String phone = iReq.getBody().get(FIELD_PHONE).toString();
                    String goal = iReq.getBody().get(FIELD_GOAL).toString();
                    String name = iReq.getBody().get(FIELD_NAME).toString();
                    jsonResponse = register(phone, goal, name);
                    break;
                case "/verify":
                    jsonResponse = getSecret(iReq.getBody().get(FIELD_UUID).toString(),
                            iReq.getBody().get(FIELD_PIN).toString());
                    break;
                case "/log-action":
                    jsonResponse = logAction(
                            iReq.getBody().get(FIELD_UUID).toString(),
                            iReq.getBody().get(FIELD_SECRET).toString(),
                            iReq.getBody().get(FIELD_ACTION).toString());
                    break;
                case "/set-friend":
                    jsonResponse = setFriend(
                            iReq.getBody().get(FIELD_UUID).toString(),
                            iReq.getBody().get(FIELD_SECRET).toString(),
                            iReq.getBody().get(FIELD_FRIEND).toString());
                    break;
                case "/get-count":
                    jsonResponse = getCount(
                            iReq.getBody().get(FIELD_UUID).toString(),
                            iReq.getBody().get(FIELD_SECRET).toString());
                    break;
            }

        } catch (ParseException | IOException ex) {
            jsonResponse = createErrorResponse(ex.getMessage());
        }

        writeResponse(jsonResponse, outputStream);
    }

    private JSONObject register(String phone, String goal, String name) {
        //TODO: Validate input
        HashMap<String, AttributeValue> itemVals
                = new HashMap<>();

        //Generate pin
        SecureRandom random = new SecureRandom();
        int num = random.nextInt(100000);
        String formattedPin = String.format("%05d", num);

        //Build item
        String uuid = UUID.randomUUID().toString();
        itemVals.put(FIELD_UUID, new AttributeValue(uuid));
        itemVals.put(FIELD_PHONE, new AttributeValue(phone));
        itemVals.put(FIELD_NAME, new AttributeValue(name));
        itemVals.put(FIELD_PIN, new AttributeValue(formattedPin));
        itemVals.put(FIELD_GOAL, new AttributeValue(goal));
        itemVals.put(FIELD_SECRET, new AttributeValue(UUID.randomUUID().toString()));
        itemVals.put(FIELD_COUNT, new AttributeValue("0"));
        itemVals.put(FIELD_REPORTED, new AttributeValue("2000-01-01"));

        //save
        saveData(itemVals);

        try {
            if (!sendTextMessage(phone, "SinceMyLast Verification Code: " + formattedPin)) {
                return createErrorResponse("Nexmo Error!");
            }
        } catch (IOException ex) {
            return createErrorResponse("Nexmo Error!");
        }

        Map<String, Object> response = new HashMap<>();
        response.put(FIELD_UUID, uuid);
        return createSuccessResponse(response);
    }

    private JSONObject getSecret(String uuid, String pin) {
        HashMap<String, AttributeValue> keysAttr
                = new HashMap<>();
        keysAttr.put(FIELD_UUID, new AttributeValue(uuid));

        Map<String, AttributeValue> userItem = dynamoDbClient
                .getItem(DYNAMO_TABLE, keysAttr)
                .getItem();

        if (!pin.equals(userItem.get(FIELD_PIN).getS())) {
            return createErrorResponse("Invalid Verification Code!", 401);
        }

        Map<String, Object> response = new HashMap<>();
        response.put(FIELD_SECRET, userItem.get(FIELD_SECRET).getS());

        return createSuccessResponse(response);
    }

    private JSONObject logAction(String uuid, String secret, String action) {
        Map<String, AttributeValue> data = getData(uuid);

        if (!validateUsr(data, secret)) {
            return createErrorResponse("Invalid secret", 401);
        }

        //TODO: Validate an action hasn't been reported today
        int count = 0;
        switch (action) {
            case ACTION_SUCCESS:
                //increment count
                count = Integer.valueOf(data.get(FIELD_COUNT).getS());
                count++;
                data.put(FIELD_COUNT, new AttributeValue(count + ""));
                data.put(FIELD_REPORTED, new AttributeValue(SDF.format(new Date())));
                saveData(data);
                break;
            case ACTION_RESET:
                data.put(FIELD_COUNT, new AttributeValue("0"));
                data.put(FIELD_REPORTED, new AttributeValue(SDF.format(new Date())));

                //notify friend if set
                String friend = data.getOrDefault(FIELD_FRIEND, new AttributeValue()).getS();
                saveData(data);
                if (!StringUtils.isNullOrEmpty(friend)) {
                    try {
                        sendTextMessage(friend, data.get(FIELD_NAME).getS()
                                + " " + data.get(FIELD_GOAL).getS() + " today!");
                    } catch (IOException ex) {
                        logger.log("Failed to send friend notification");
                    }
                }
                break;
            default:
                return createErrorResponse("Invalid action value", 400);
        }
        Map<String, Object> response = new HashMap<>();
        response.put(FIELD_COUNT, count);
        return createSuccessResponse(response);

    }

    private JSONObject setFriend(String uuid, String secret, String friend) {
        Map<String, AttributeValue> data = getData(uuid);

        //TODO validate friend phone number (10-digits only)
        if (!validateUsr(data, secret)) {
            return createErrorResponse("Invalid secret", 401);
        }

        data.put(FIELD_FRIEND, new AttributeValue(friend));
        saveData(data);
        return createEmptySuccessResponse();
    }

    private JSONObject getCount(String uuid, String secret) {
        Map<String, AttributeValue> data = getData(uuid);

        if (!validateUsr(data, secret)) {
            return createErrorResponse("Invalid secret", 401);
        }

        Map<String, Object> response = new HashMap<>();
        response.put(FIELD_COUNT, Integer.valueOf(data.get(FIELD_COUNT).getS()));
        response.put(FIELD_GOAL, data.get(FIELD_GOAL).getS());
        response.put(FIELD_REPORTED, data.get(FIELD_REPORTED).getS());
        response.put(FIELD_ALLOW_REPORT,
                !data.get(FIELD_REPORTED).getS().equals(SDF.format(new Date())));
        response.put(FIELD_FRIEND, data.getOrDefault(FIELD_FRIEND, new AttributeValue()).getS());
        saveData(data);
        return createSuccessResponse(response);
    }

    private boolean validateUsr(Map<String, AttributeValue> data, String secret) {
        return data.get(FIELD_SECRET).getS().equals(secret);
    }

    private Map<String, AttributeValue> getData(String uuid) {
        HashMap<String, AttributeValue> keysAttr
                = new HashMap<>();
        keysAttr.put(FIELD_UUID, new AttributeValue(uuid));

        return dynamoDbClient
                .getItem(DYNAMO_TABLE, keysAttr)
                .getItem();
    }

    private void saveData(Map<String, AttributeValue> data) {
        dynamoDbClient.putItem(DYNAMO_TABLE, data);
    }

    private boolean sendTextMessage(String to, String message) throws IOException {
        OkHttpClient client = new OkHttpClient();

        MediaType mediaType = MediaType.parse("application/x-www-form-urlencoded");
        RequestBody body = RequestBody.create(mediaType,
                "api_key=" + NEXMO_API_KEY + "&api_secret=" + NEXMO_API_SECRET + "&to="
                + to + "&from=" + NEXMO_PHONE_NUM + "&text=" + URLEncoder.encode(message));
        Request request = new Request.Builder()
                .url("https://rest.nexmo.com/sms/json")
                .post(body)
                .addHeader("content-type", "application/x-www-form-urlencoded")
                .addHeader("cache-control", "no-cache")
                .build();
        logger.log("making nexmo call using " + NEXMO_PHONE_NUM);
        Response response = client.newCall(request).execute();
        return response.isSuccessful();
    }
}
