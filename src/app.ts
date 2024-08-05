import express, { Request, Response } from "express"
import axios from "axios"
import { sendMail } from "./mailer"
import path from "path"
import cors from "cors"

const rdpInfo = {
  "server": "34.224.109.221",
  "user": "administrator",
  "password": "mO29pXzn%B2Kf(hwoBM$vOXbpDQ3hoWw"
}

const app = express();

const ec2BackendUrl = process.env.EC2_BACKEND_URL;
const backendIp = process.env.BACKEND_IP;

const staticDir = path.join(__dirname, "../static");
app.use(cors());
app.use(express.static(staticDir));

app.get("/launch", async (req: Request, res: Response) => {

  axios.get(`${ec2BackendUrl}/launch`, {params: {id: req.query.id}});
  const passwordHash = (await axios.get(`http://${backendIp}/Myrtille/GetHash.aspx`, { params: { password: rdpInfo.password } })).data;
  res.redirect(encodeURI(`http://${backendIp}/Myrtille/?__EVENTTARGET=&__EVENTARGUMENT=&server=${rdpInfo.server}&user=${rdpInfo.user}&passwordHash=${passwordHash}&connect=Connect`))
});


app.get("/invite", async (req: Request, res: Response) => {
  const { email } = req.query;
  sendMail(email as string, "Invitation to study", `Hi, please participate in the study here http://${backendIp}/launch?id=ondriah`);

});

app.get("/logs", async (req: Request, res: Response) => {
  res.send((await axios.get(`${ec2BackendUrl}/logs`, {params: {id: req.query.id}})).data);
})

app.listen(8001, () => {
  console.log("server running on port 8001");
})