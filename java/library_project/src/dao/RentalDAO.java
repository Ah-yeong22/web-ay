package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import db.DBUtil;

public class RentalDAO {

    // =========================
    // 1. 도서 대여 처리
    // =========================
    public void rentalBook(int customerId, int bookId) {

        Connection conn = null;
        PreparedStatement pstmt1 = null;
        PreparedStatement pstmt2 = null;
        PreparedStatement pstmt3 = null;
        ResultSet rs = null;

        try {

            conn = DBUtil.getConnection();
            conn.setAutoCommit(false);

            // 1. 재고 확인
            String stockSql = "SELECT stock FROM book WHERE book_id = ?";

            pstmt1 = conn.prepareStatement(stockSql);
            pstmt1.setInt(1, bookId);

            rs = pstmt1.executeQuery();

            if (rs.next()) {

                int stock = rs.getInt("stock");

                if (stock <= 0) {
                    System.out.println("재고 부족");
                    conn.rollback();
                    return;
                }

            } else {
                System.out.println("도서 없음");
                conn.rollback();
                return;
            }

            // 2. 대여 등록
            String rentalSql =
                "INSERT INTO rental(customer_id, book_id) VALUES(?, ?)";

            pstmt2 = conn.prepareStatement(rentalSql);
            pstmt2.setInt(1, customerId);
            pstmt2.setInt(2, bookId);

            pstmt2.executeUpdate();

            // 3. 재고 감소
            String updateSql =
                "UPDATE book SET stock = stock - 1 WHERE book_id = ?";

            pstmt3 = conn.prepareStatement(updateSql);
            pstmt3.setInt(1, bookId);

            pstmt3.executeUpdate();

            conn.commit();

            System.out.println("도서 대여 완료");

        } catch (Exception e) {

            try {
                if (conn != null) conn.rollback();
            } catch (Exception e2) {}

            e.printStackTrace();

        } finally {

            try {
                if (rs != null) rs.close();
                if (pstmt1 != null) pstmt1.close();
                if (pstmt2 != null) pstmt2.close();
                if (pstmt3 != null) pstmt3.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // =========================
    // 2. 전체 대여 목록 조회
    // =========================
    public void findRentalList() {

        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {

            conn = DBUtil.getConnection();

            String sql =
                "SELECT r.rental_id, c.name, b.title, r.rental_date " +
                "FROM rental r " +
                "JOIN customer c ON r.customer_id = c.customer_id " +
                "JOIN book b ON r.book_id = b.book_id";

            pstmt = conn.prepareStatement(sql);
            rs = pstmt.executeQuery();

            while (rs.next()) {

                System.out.println("대여번호: " + rs.getInt("rental_id"));
                System.out.println("고객명: " + rs.getString("name"));
                System.out.println("도서명: " + rs.getString("title"));
                System.out.println("대여일: " + rs.getDate("rental_date"));
                System.out.println("----------------------");
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (pstmt != null) pstmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // =========================
    // 3. 고객별 대여 목록 조회
    // =========================
    public void findRentalByCustomer(int customerId) {

        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {

            conn = DBUtil.getConnection();

            String sql =
                "SELECT c.name, b.title, r.rental_date " +
                "FROM rental r " +
                "JOIN customer c ON r.customer_id = c.customer_id " +
                "JOIN book b ON r.book_id = b.book_id " +
                "WHERE r.customer_id = ? " +
                "ORDER BY r.rental_date DESC";

            pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, customerId);

            rs = pstmt.executeQuery();

            boolean check = false;

            while (rs.next()) {
                check = true;

                System.out.println("고객명: " + rs.getString("name"));
                System.out.println("도서명: " + rs.getString("title"));
                System.out.println("대여일: " + rs.getDate("rental_date"));
                System.out.println("----------------------");
            }

            if (!check) {
                System.out.println("해당 고객의 대여 내역이 없습니다.");
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (pstmt != null) pstmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}