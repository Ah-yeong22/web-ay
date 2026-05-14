package Main;

import java.util.Scanner;

import dao.BookDAO;
import dao.CustomerDAO;
import dao.RentalDAO;
import dto.BookDTO;
import dto.CustomerDTO;

public class Main {

	public static void main(String[] args) {

		Scanner sc = new Scanner(System.in);

		CustomerDAO customerDAO = new CustomerDAO();
		BookDAO bookDAO = new BookDAO();
		RentalDAO rentalDAO = new RentalDAO();

		while(true) {

			System.out.println("\n===== 도서 대여 관리 프로그램 =====");
			System.out.println("1. 고객 등록");
			System.out.println("2. 도서 등록");
			System.out.println("3. 도서 전체 조회");
			System.out.println("4. 도서 대여");
			System.out.println("5. 전체 대여 목록 조회");
			System.out.println("6. 고객별 대여 목록 조회");
			System.out.println("0. 종료");

			System.out.print("메뉴 선택 : ");

			int menu = sc.nextInt();
			sc.nextLine();

			switch(menu) {

			case 1:

				// 고객 등록
				System.out.print("고객명 입력 : ");
				String name = sc.nextLine();

				System.out.print("전화번호 입력 : ");
				String phone = sc.nextLine();

				CustomerDTO customerDTO =
						new CustomerDTO(name, phone);

				customerDAO.insertCustomer(customerDTO);

				break;

			case 2:

				// 도서 등록
				System.out.print("도서 제목 : ");
				String title = sc.nextLine();

				System.out.print("저자 : ");
				String author = sc.nextLine();

				System.out.print("재고 수량 : ");
				int stock = sc.nextInt();

				BookDTO bookDTO =
						new BookDTO(0, title, author, stock);

				bookDAO.insertBook(bookDTO);

				break;

			case 3:

				// 도서 전체 조회
				bookDAO.findAllBooks();

				break;

			case 4:

				// 도서 대여
				System.out.print("고객번호 입력 : ");
				int customerId = sc.nextInt();

				System.out.print("도서번호 입력 : ");
				int bookId = sc.nextInt();

				rentalDAO.rentalBook(customerId, bookId);

				break;

			case 5:

				// 전체 대여 목록 조회
				rentalDAO.findRentalList();

				break;
				
			case 6:
				//고객별 대여 목록 조회
				//고객 id를 입력받아서 고객명, 제목, 빌린날짜 순으로 출력하기 
				System.out.println("고객 번호 입력 :");
				int customerId2 = sc.nextInt();
				
				rentalDAO.findRentalList();
				
				break;
				
			case 7:
				//재고부족 도서 조회
				//재고가 2권 이하인 도서를 조회 
				//findLowStockBooks()
				System.out.println("도서 조회 : ");
				

			case 0:

				System.out.println("프로그램 종료");

				sc.close();

				return;
				

			default:

				System.out.println("잘못된 메뉴입니다.");
			}
		}
	}
}