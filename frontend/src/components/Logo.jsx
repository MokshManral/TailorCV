import lightLogo from "../../assets/LightLogo.png";
import darkLogo from "../../assets/Logo.png";

export default function Logo({ dark, className = "h-10 w-10" }) {
  return (
    <img
      src={dark ? darkLogo : lightLogo}
      alt="TailorCV"
      className={`${className} object-contain`}
    />
  );
}