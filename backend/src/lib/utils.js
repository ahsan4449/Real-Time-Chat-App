// import jwt from "jsonwebtoken";

// export const generateToken=(userId,res)=>{
//    const token=jwt.sign({userId},process.env.JWT_SECRET,{
//     expiresIn:"7d"
//    })

//    res.cookie("jwt",token,{
//     maxAge:7*24*60*60*1000,
//     httpOnly:true,
//     sameSite:"strict",
//     secure:process.env.NODE_ENV!=="development"
//    })
//    return token;
// }



import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only true on Render
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // allow cross-site cookies
  });

  return token;
};
