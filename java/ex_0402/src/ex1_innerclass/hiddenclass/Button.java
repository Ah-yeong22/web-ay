package ex1_innerclass.hiddenclass;

public class Button {

	public static interface ClickListener{
		void onClick();
	}
	ClickListener clickListener;
	
	public void setClickListener(ClickListener clickListener) {
		this.clickListener = clickListener;
	}
	void click() {
		clickListener.onClick();
	}
	
	
	
}
