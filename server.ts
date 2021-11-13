const net = require("net");
const dgram = require("dgram");
const udpServer = dgram.createSocket("udp4");
const DomParser = require("dom-parser");
const parser = new DomParser();
try{
udpServer.on("error", (err) => {
    console.log(`server error:\n${err.stack}`);
    udpServer.close();
});

try {
    createTCPServer("192.168.0.106");
} catch (e) {
}

udpServer.on("message", (msg, rinfo) => {
    const mData = parser.parseFromString(msg.toString(), "application/xml");
    if (mData.getElementsByTagName("myclimate").length) {
        if (mData.getElementsByTagName("get")[0].innerHTML === "discovery") {
            sendDiscoverySuccess(mData.getElementsByTagName("ip")[0].innerHTML);
        }
    }
});
udpServer.on("listening", () => {
    const address = udpServer.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

udpServer.bind(10001);

function sendDiscoverySuccess(mToIP) {
    let client = new net.Socket();
    client.connect(10003, mToIP, function () {
        console.log(new Date(), "Connected");
        client.write('<myclimate>' +
            '<response>discovery</response>' +
            '<ip>192.168.0.106</ip>' +
            '<serial>502-0173-010005</serial>' +
            '<version>1.2.3</version>' +
            '<port>10002</port>' +
            '<status>provisioning</status>' +
            '</myclimate>');

        // client.write(
        //     "<myclimate>" +
        //     "<response>discovery</response>" +
        //     "<ip>192.168.0.106</ip>" +
        //     "<serial>502-0173-010005</serial>" +
        //     "<version>1.2.3</version>" +
        //     "<port>10002</port>" +
        //     "<status>router</status>" +
        //     "</myclimate>"
        // );
    });

    client.on("data", function (data) {
        console.log("Received: " + data);
        client.destroy(); // kill client after server's response
    });

    client.on("close", function () {
        console.log("Connection closed");
    });
}

function createTCPServer(mBindIP) {
    const server = net
        .createServer((socket) => {
            socket.on("data", (data) => {
                console.log(new Date(), data.toString());
                const mData = parser.parseFromString(
                    data.toString(),
                    "application/xml"
                );
                try {
                    console.log("Replying...");
                    if (mData.getElementsByTagName("myclimate").length) {
                        if (mData.getElementsByTagName("get").length > 0) {
                            if (
                                mData.getElementsByTagName("get")[0].innerHTML ===
                                "installation"
                            ) {
                                socket.write(
                                    "<myclimate><response>installation</response><appliance><type>heat</type><zoneList>2,Common</zoneList></appliance><appliance><type>cool</type><zoneList>2,Common</zoneList></appliance><appliance><type>evap</type><zoneList/></appliance><zoneName id=\"2\">Zone 2</zoneName><zoneName id=\"Common\">Common</zoneName></myclimate>"
                                );
                            } else if (
                                mData.getElementsByTagName("get")[0].innerHTML === "getzoneinfo"
                            ) {
                                socket.write(
                                    "<myclimate>" +
                                    "    <response>getzoneinfo</response>" +
                                    "    <zoneList>Common,1</zoneList>" +
                                    "    <system>off</system>" +
                                    "    <type>heat</type>" +
                                    "    <mode>thermo</mode>" +
                                    "    <setPoint>22</setPoint>" +
                                    "    <fanSpeed>4</fanSpeed>" +
                                    '    <roomTemp id="Common">19</roomTemp>' +
                                    '    <roomTemp id="1">20' +
                                    "    </roomTemp>" +
                                    "  </myclimate>"
                                );
                            } else if (
                                mData.getElementsByTagName("get")[0].innerHTML === "getprogram"
                            ) {
                                socket.write(
                                    "<myclimate>" +
                                    "<response>getprogram</response><range>monday</range>" +
                                    '<period id="1">' +
                                    "<state>active</state>" +
                                    "<time>0600</time>" +
                                    "<setPoint>21</setPoint>" +
                                    "<zoneList>1,2</zoneList>" +
                                    "</period>" +
                                    '<period id="2">' +
                                    "<state>idle</state>" +
                                    "<time>0900</time>" +
                                    "<zoneList>1,2</zoneList>" +
                                    "</period>" +
                                    '<period id="3">' +
                                    "<state>active</state>" +
                                    "<time>1700</time>" +
                                    "<setPoint>21</setPoint>" +
                                    "<zoneList>1,2,3,4</zoneList>" +
                                    "</period>" +
                                    '<period id="4">' +
                                    "<state>idle</state>" +
                                    "<time>2200</time>" +
                                    "<zoneList>1,2,3,4</zoneList>" +
                                    "</period>" +
                                    "<range>tuesday</range>" +
                                    '<period id="1">' +
                                    "<state>active</state>" +
                                    "<time>0600</time>" +
                                    "<setPoint>21</setPoint>" +
                                    "<zoneList>1,2</zoneList>" +
                                    "</period>" +
                                    '<period id="2">' +
                                    "<state>idle</state>" +
                                    "<time>0900</time>" +
                                    "<zoneList>1,2</zoneList>" +
                                    "</period>" +
                                    '<period id="3">' +
                                    "<state>active</state>" +
                                    "<time>1700</time>" +
                                    "<setPoint>21</setPoint>" +
                                    "<zoneList>1,2,3,4</zoneList>" +
                                    "</period>" +
                                    '<period id="4">' +
                                    "<state>idle</state>" +
                                    "<time>2200</time>" +
                                    "<zoneList>1,2,3,4</zoneList>" +
                                    "</period>" +
                                    "</myclimate>"
                                );
                            }
                        } else if (mData.getElementsByTagName("post").length > 0) {
                            if (
                                mData.getElementsByTagName("post")[0].innerHTML ===
                                "postzoneinfo"
                            ) {
                                socket.write(
                                    "<myclimate>" +
                                    "<response>postzoneinfo</response>" +
                                    "<result>ok</result>" +
                                    "</myclimate>"
                                );
                            } else if (
                                mData.getElementsByTagName("post")[0].innerHTML === "provision"
                            ) {
                                socket.write(
                                    "<myclimate><response>provision</response><user>it@mettlesoft.com.au</user><status>1</status></myclimate>"
                                );
                            } else {
                                socket.write(
                                    "<myclimate>" +
                                    "<response>postzoneinfo</response>" +
                                    "<result>ok</result>" +
                                    "</myclimate>"
                                );
                            }
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });
        })
        .on("error", (err) => {
            // Handle errors here.
            throw err;
        });

    server.listen({port: 10002, family: "IPv4", host: mBindIP}, () => {
        console.log("opened server on", server.address());
    });
}
}catch(e){
    console.log(e);
}