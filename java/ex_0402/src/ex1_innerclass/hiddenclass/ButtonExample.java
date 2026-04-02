package ex1_innerclass.hiddenclass;

public class ButtonExample {

	public static void main(String[] args) {
		//메서드에 매개변수로 전달하는 방식을 이용하여 이벤트 처리하기 
		Button btnOk = new Button();
		btnOk.setClickListener(new Button.ClickListener() {
			
			@Override
			public void onClick() {
				System.out.println("확인버튼을 누름");
				
			}
		});
		btnOk.click();//버튼을 누름
		
		Button btnCancle = new Button();
		btnCancle.setClickListener(new Button.ClickListener() {
			
			@Override
			public void onClick() {
				System.out.println("닫기");
				
			}
		});
		btnCancle.click();//버튼을 누름
	}
	

}
