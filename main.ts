// parses 2 comma-separated numbers and returns an echo for confirmation.
function parseInput (input2: string) {
    temp = input2.split(",")
    turnstrength = parseFloat(temp[0])
    forwardbackward = parseFloat(temp[1])
    return "turning = " + temp[0] + "%, forward/backward = " + temp[1] + "%"
}
bluetooth.onBluetoothConnected(function () {
    basic.showString("connected")
    basic.showIcon(IconNames.Happy)
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showString("disconnected")
    basic.showIcon(IconNames.No)
})
// Parse text input from serial connection over the Bluetooth radio.
// 
// Expected input format is "<turning-strength>,<forward-backward>".
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    bluetooth.uartWriteLine(parseInput(bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))))
})
// Parse text input from serial connection over the USB wire. This feature is meant for debugging before using Bluetooth
// 
// Expected input format is "<turning-strength>,<forward-backward>".
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    serial.writeLine("" + (parseInput(serial.readUntil(serial.delimiters(Delimiters.NewLine)))))
})
let temp: string[] = []
let forwardbackward = 0
let turnstrength = 0
// must be in a range from -100 to 100
turnstrength = 0
// must be in a range from -100 to 100
forwardbackward = 0
// enable motor outputs
motobit.enable(MotorPower.On)
bluetooth.startUartService()
serial.redirectToUSB()
serial.setBaudRate(BaudRate.BaudRate9600)
basic.forever(function () {
    // If turning in place. Else going forward or backward while turning (AKA "veering")
    if (forwardbackward == 0) {
        // if turning in place clockwise (" > 0") or counterclockwise (" < 0"). Else all motion stopped
        if (turnstrength > 0) {
            motobit.setMotorSpeed(Motor.Left, MotorDirection.Forward, turnstrength)
            motobit.setMotorSpeed(Motor.Right, MotorDirection.Reverse, turnstrength)
        } else if (turnstrength < 0) {
            motobit.setMotorSpeed(Motor.Left, MotorDirection.Reverse, Math.abs(turnstrength))
            motobit.setMotorSpeed(Motor.Right, MotorDirection.Forward, Math.abs(turnstrength))
        } else {
            motobit.setMotorSpeed(Motor.Left, MotorDirection.Forward, 0)
            motobit.setMotorSpeed(Motor.Right, MotorDirection.Forward, 0)
        }
    } else {
        // If "veering" to the right. Else If "veering" to the left. Else just going forward or backward
        if (turnstrength > 0) {
            // If just going forward while turning. Else going backward while turning
            if (forwardbackward > 0) {
                motobit.setMotorSpeed(Motor.Left, MotorDirection.Forward, forwardbackward)
                motobit.setMotorSpeed(Motor.Right, MotorDirection.Forward, Math.round(forwardbackward * (1 - turnstrength / 100)))
            } else {
                motobit.setMotorSpeed(Motor.Left, MotorDirection.Reverse, Math.abs(forwardbackward))
                motobit.setMotorSpeed(Motor.Right, MotorDirection.Reverse, Math.abs(forwardbackward) * (1 - turnstrength / 100))
            }
        } else if (turnstrength < 0) {
            // If just going forward while turning. Else going backward while turning
            if (forwardbackward > 0) {
                motobit.setMotorSpeed(Motor.Left, MotorDirection.Forward, forwardbackward * (1 - turnstrength / -100))
                motobit.setMotorSpeed(Motor.Right, MotorDirection.Forward, forwardbackward)
            } else {
                motobit.setMotorSpeed(Motor.Left, MotorDirection.Reverse, Math.abs(forwardbackward) * (1 - turnstrength / -100))
                motobit.setMotorSpeed(Motor.Right, MotorDirection.Reverse, Math.abs(forwardbackward))
            }
        } else {
            // If just going forward. Else just going backward
            if (forwardbackward > 0) {
                motobit.setMotorSpeed(Motor.Left, MotorDirection.Forward, forwardbackward)
                motobit.setMotorSpeed(Motor.Right, MotorDirection.Forward, forwardbackward)
            } else {
                motobit.setMotorSpeed(Motor.Left, MotorDirection.Reverse, Math.abs(forwardbackward))
                motobit.setMotorSpeed(Motor.Right, MotorDirection.Reverse, Math.abs(forwardbackward))
            }
        }
    }
})
