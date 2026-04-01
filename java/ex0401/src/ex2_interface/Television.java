package ex2_interface;

public class Television implements RemoteControl {

    int volume; // 

    @Override
    public void turnOn() {
        System.out.println("텔레비전에 내가 나왔으면");
    }

    @Override
    public void setVolume(int volume) {
        if (volume > RemoteControl.MAX_VOLUME) {
            this.volume = RemoteControl.MAX_VOLUME;
        } else if (volume < RemoteControl.MIN_VOLUME) {
            this.volume = RemoteControl.MIN_VOLUME;
        } else {
            this.volume = volume;
        }
    }
}
