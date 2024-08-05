import express, { Request, Response } from "express"
import axios from "axios"
import { sendMail } from "./mailer"
import fs from "fs"
import path from "path"
import cors from "cors"

const rdpInfo = {
  "server": "107.23.191.127",
  "user": "administrator",
  "password": "mO29pXzn%B2Kf(hwoBM$vOXbpDQ3hoWw"
}

const app = express();

const ec2BackendUrl = process.env.EC2_BACKEND_URL;

const staticDir = path.join(__dirname, "../static");
app.use(cors());
app.use(express.static(staticDir));

app.get("/launch", async (req: Request, res: Response) => {

  axios.get(`${ec2BackendUrl}/launch`, {params: {id: req.query.id}});
  const passwordHash = (await axios.get("http://localhost/Myrtille/GetHash.aspx", { params: { password: rdpInfo.password } })).data;
  await axios.get("http://localhost/Myrtille", {
    params: {
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      server: rdpInfo.server,
      user: rdpInfo.user,
      passwordHash
    }
  });

  res.redirect(encodeURI(`http://localhost/Myrtille/?__EVENTTARGET=&__EVENTARGUMENT=&server=${rdpInfo.server}&user=${rdpInfo.user}&passwordHash=${passwordHash}&connect=Connect`))
});


app.get("/invite", async (req: Request, res: Response) => {
  const { email } = req.query;
  sendMail(email as string, "Invitation to study", "Hi, please participate in the study here http://localhost/launch?id=ondriah");

});

app.get("/logs", async (req: Request, res: Response) => {
  res.send((await axios.get(`${ec2BackendUrl}/logs`)).data);
})

app.listen(8001, () => {
  console.log("server running on port 8001");
})