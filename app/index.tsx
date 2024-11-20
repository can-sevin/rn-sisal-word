import { Redirect } from "expo-router";
import "../config/firebase";

export default function Index() {
  return <Redirect href="./pages/Login" />;
}