
import moment from "moment";
import { toast } from "react-toastify";
// includes
import { config } from "./config";

export  const common = {
   
  notify(type, msg) {
    switch (type) {
      case "S":
        toast.success(msg, config.elements.toast);
        break;
      case "W":
        toast.warning(msg, config.elements.toast);
        break;
      case "E":
        toast.error(msg, config.elements.toast);
        break;
      case "I":
        toast.info(msg, config.elements.toast);
        break;
      case "M":
        toast(msg, config.elements.toast);
        break;
      default:
        break;
    }
  },

  dateFormatA(val) {
    return val ? moment(val).format(config.elements.dp.formatA) : "";
  },

  
  // getFileType(fileInfo) {
  //   //let AcceptedFileGroup = "image" | "video";
  //   if (fileInfo.type.indexOf("video") !== -1) {
  //     return "video";
  //   } else if (fileInfo.type.indexOf("image") !== -1) {
  //     return "image";
  //   }
  // },

  // getUserDetails()
  // {
  //   let token= localStorage.getItem("token");
  //   if(token)
  //   return jwt_decode(token);
  // }
};