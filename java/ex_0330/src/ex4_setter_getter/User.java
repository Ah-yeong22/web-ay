package ex4_setter_getter;

public class User {

	private String username;
	private String password;
	private String email;
	
	public void setuserName(String userName) {
		if(userName.length() >= 4) {
			this.username = userName;
		}else {
			System.out.println("4글자 이상 입력하세요");
		}
		
	}
	public String getuserName() {
		return username;
	}
	
	public void setpassWord(String passWord) {
		if(passWord.length() <= 6) {
			this.password = passWord;
		}else {
			System.out.println("6글자 이상 입력해라");
		}
	}
	public String getpassWord() {
		return password;
	}
	public void setemail(String email) {
		if(email.contains("@")) {
			this.email = email;
		}else {
			System.out.println("잘못된 형식");
		}
		
	}
	public String getemail() {
		return email;
	}
}
