# Parse text input from serial connection over the Bluetooth radio.
# 
# Expected format is "<turning-strength>,<forward-backward>"

def on_uart_data_received():
    global temp, turnstrength, forwardbackward
    temp = bluetooth.uart_read_until(serial.delimiters(Delimiters.NEW_LINE)).split(",")
    turnstrength = parse_float(temp[0])
    forwardbackward = parse_float(temp[1])
bluetooth.on_uart_data_received(serial.delimiters(Delimiters.NEW_LINE),
    on_uart_data_received)

# Parse text input from serial connection over the USB wire. This meant for debugging program before using a battery instead of USB to power the micro-bit.
# 
# Expected format is "<turning-strength>,<forward-backward>"

def on_data_received():
    global temp, turnstrength, forwardbackward
    temp = serial.read_until(serial.delimiters(Delimiters.NEW_LINE)).split(",")
    turnstrength = parse_float(temp[0])
    forwardbackward = parse_float(temp[1])
serial.on_data_received(serial.delimiters(Delimiters.NEW_LINE), on_data_received)

temp: List[str] = []
forwardbackward = 0
turnstrength = 0
# must be in a range from -100 to 100
turnstrength = 0
# must be in a range from -100 to 100
forwardbackward = 0
# enable motor outputs
motobit.enable(MotorPower.ON)

def on_forever():
    # If turning in place. Else going forward or backward while turning (AKA "veering")
    if forwardbackward == 0:
        # if turning in place clockwise (" > 0") or counterclockwise (" < 0"). Else all motion stopped
        if turnstrength > 0:
            motobit.set_motor_speed(Motor.LEFT, MotorDirection.FORWARD, turnstrength)
            motobit.set_motor_speed(Motor.RIGHT, MotorDirection.REVERSE, turnstrength)
        elif turnstrength < 0:
            motobit.set_motor_speed(Motor.LEFT, MotorDirection.REVERSE, abs(turnstrength))
            motobit.set_motor_speed(Motor.RIGHT, MotorDirection.FORWARD, abs(turnstrength))
        else:
            motobit.set_motor_speed(Motor.LEFT, MotorDirection.FORWARD, 0)
            motobit.set_motor_speed(Motor.RIGHT, MotorDirection.FORWARD, 0)
    else:
        # If "veering" to the right. Else If "veering" to the left. Else just going forward or backward
        if turnstrength > 0:
            # If just going forward while turning. Else going backward while turning
            if forwardbackward > 0:
                motobit.set_motor_speed(Motor.LEFT, MotorDirection.FORWARD, forwardbackward)
                motobit.set_motor_speed(Motor.RIGHT,
                    MotorDirection.FORWARD,
                    Math.round(forwardbackward * (1 - turnstrength / 100)))
            else:
                motobit.set_motor_speed(Motor.LEFT, MotorDirection.REVERSE, abs(forwardbackward))
                motobit.set_motor_speed(Motor.RIGHT,
                    MotorDirection.REVERSE,
                    abs(forwardbackward) * (1 - turnstrength / 100))
        elif turnstrength < 0:
            # If just going forward while turning. Else going backward while turning
            if forwardbackward > 0:
                motobit.set_motor_speed(Motor.LEFT,
                    MotorDirection.FORWARD,
                    forwardbackward * (1 - turnstrength / -100))
                motobit.set_motor_speed(Motor.RIGHT, MotorDirection.FORWARD, forwardbackward)
            else:
                motobit.set_motor_speed(Motor.LEFT,
                    MotorDirection.REVERSE,
                    abs(forwardbackward) * (1 - turnstrength / -100))
                motobit.set_motor_speed(Motor.RIGHT, MotorDirection.REVERSE, abs(forwardbackward))
        else:
            # If just going forward. Else just going backward
            if forwardbackward > 0:
                motobit.set_motor_speed(Motor.LEFT, MotorDirection.FORWARD, forwardbackward)
                motobit.set_motor_speed(Motor.RIGHT, MotorDirection.FORWARD, forwardbackward)
            else:
                motobit.set_motor_speed(Motor.LEFT, MotorDirection.REVERSE, abs(forwardbackward))
                motobit.set_motor_speed(Motor.RIGHT, MotorDirection.REVERSE, abs(forwardbackward))
basic.forever(on_forever)
