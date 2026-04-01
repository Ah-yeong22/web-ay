package ex3__interface2;

//물리적 버튼
public class Button {

	ClickLisxtener listener;
	
	public void setClickLisxtener(ClickLisxtener listener) {
		this.listener = listener;
	}
	
	public void click() {
		listener.onClick();
		}
}
