package ex1_exception.customException;

public class AccountMain {

	public static void main(String[] args) {
		Account account = new Account();
		
		account.deposit(100000);
		System.out.println("예금액 : "+account.getBalance());
		
		try {
			account.withdraw(150000);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		
	}
}
