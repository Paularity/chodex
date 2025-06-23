export const FakeAPI = {
  sendOtp: (username: string): Promise<void> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!username || username === "fail") {
          reject(new Error("Failed to send OTP. Invalid username."));
        } else {
          resolve();
        }
      }, 1500);
    }),

  verifyOtp: (otp: string): Promise<void> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === "123456") {
          resolve();
        } else {
          reject(new Error("Invalid OTP."));
        }
      }, 1500);
    }),
};
